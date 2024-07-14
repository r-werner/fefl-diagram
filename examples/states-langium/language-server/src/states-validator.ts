/********************************************************************************
 * Copyright (c) 2021-2022 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { AstNode, AstUtils,
    // DiagnosticInfo, MultiMap,
    ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
// import { StatesAstType, State, Transition, StateMachine } from './generated/ast.js';
import { BinaryExpression, Class, ExpressionBlock, FunctionDeclaration, isReturnStatement,
    FeflAstType, MethodMember, TypeReference, UnaryExpression, VariableDeclaration,
    ConstantDeclaration} from './generated/ast.js';
import { StatesServices } from './states-module.js';

import { isAssignable } from './type-system/assignment.js';
import { isVoidType, TypeDescription, typeToString } from './type-system/descriptions.js';
import { inferType } from './type-system/infer.js';
import { isLegalOperation } from './type-system/operator.js';


// export function registerValidationChecks(services: StatesServices) {
//     const registry = services.validation.ValidationRegistry;
//     const validator = services.validation.StatesValidator;
//     const checks: ValidationChecks<StatesAstType> = {
//         State: validator.checkState,
//         StateMachine: validator.checkUniqueNames,
//         Transition: validator.checkTransition
//     };
//     registry.register(checks, validator);
// }
/**
 * Registry for validation checks.
 */
export class LoxValidationRegistry extends ValidationRegistry {
    constructor(services: StatesServices) {
        super(services);
        const validator = services.validation.StatesValidator;
        const checks: ValidationChecks<FeflAstType> = {
            BinaryExpression: validator.checkBinaryOperationAllowed,
            UnaryExpression: validator.checkUnaryOperationAllowed,
            VariableDeclaration: validator.checkVariableDeclaration,
            ConstantDeclaration: validator.checkConstantDeclaration,
            MethodMember: validator.checkMethodReturnType,
            Class: validator.checkClassDeclaration,
            FunctionDeclaration: validator.checkFunctionReturnType
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class StatesValidator {

    checkFunctionReturnType(func: FunctionDeclaration, accept: ValidationAcceptor): void {
        this.checkFunctionReturnTypeInternal(func.body, func.returnType, accept);
    }

    checkMethodReturnType(method: MethodMember, accept: ValidationAcceptor): void {
        this.checkFunctionReturnTypeInternal(method.body, method.returnType, accept);
    }

    // TODO: implement classes
    checkClassDeclaration(declaration: Class, accept: ValidationAcceptor): void {
        accept('error', 'Classes are currently unsupported.', {
            node: declaration,
            property: 'name'
        });
    }

    private checkFunctionReturnTypeInternal(body: ExpressionBlock, returnType: TypeReference, accept: ValidationAcceptor): void {
        const map = this.getTypeCache();
        const returnStatements = AstUtils.streamAllContents(body).filter(isReturnStatement).toArray();
        const expectedType = inferType(returnType, map);
        if (returnStatements.length === 0 && !isVoidType(expectedType)) {
            accept('error', "A function whose declared type is not 'void' must return a value.", {
                node: returnType
            });
            return;
        }
        for (const returnStatement of returnStatements) {
            const returnValueType = inferType(returnStatement, map);
            if (!isAssignable(returnValueType, expectedType)) {
                accept('error', `Type '${typeToString(returnValueType)}' is not assignable to type '${typeToString(expectedType)}'.`, {
                    node: returnStatement
                });
            }
        }
    }

    checkConstantDeclaration(decl: ConstantDeclaration, accept: ValidationAcceptor): void {
        if (decl.type && decl.value) {
            const map = this.getTypeCache();
            const left = inferType(decl.type, map);
            const right = inferType(decl.value, map);
            if (!isAssignable(right, left)) {
                accept('error', `Type '${typeToString(right)}' is not assignable to type '${typeToString(left)}'.`, {
                    node: decl,
                    property: 'value'
                });
            }
        } else if (!decl.value) {
            accept('error', 'Constants require an assignment at creation', {
                node: decl,
                property: 'name'
            });
        }
    }

    checkVariableDeclaration(decl: VariableDeclaration, accept: ValidationAcceptor): void {
        if (decl.type && decl.value) {
            const map = this.getTypeCache();
            const left = inferType(decl.type, map);
            const right = inferType(decl.value, map);
            if (!isAssignable(right, left)) {
                accept('error', `Type '${typeToString(right)}' is not assignable to type '${typeToString(left)}'.`, {
                    node: decl,
                    property: 'value'
                });
            }
        } else if (!decl.type && !decl.value) {
            accept('error', 'Variables require a type hint or an assignment at creation', {
                node: decl,
                property: 'name'
            });
        }
    }

    checkBinaryOperationAllowed(binary: BinaryExpression, accept: ValidationAcceptor): void {
        const map = this.getTypeCache();
        const left = inferType(binary.left, map);
        const right = inferType(binary.right, map);
        if (!isLegalOperation(binary.operator, left, right)) {
            accept('error', `Cannot perform operation '${binary.operator}' on values of type '${typeToString(left)}' and '${typeToString(right)}'.`, {
                node: binary
            });
        } else if (binary.operator === '=') {
            if (!isAssignable(right, left)) {
                accept('error', `Type '${typeToString(right)}' is not assignable to type '${typeToString(left)}'.`, {
                    node: binary,
                    property: 'right'
                });
            }
        } else if (['==', '!='].includes(binary.operator)) {
            if (!isAssignable(right, left)) {
                accept('warning', `This comparison will always return '${binary.operator === '==' ? 'false' : 'true'}' as types '${typeToString(left)}' and '${typeToString(right)}' are not compatible.`, {
                    node: binary,
                    property: 'operator'
                });
            }
        }
    }

    checkUnaryOperationAllowed(unary: UnaryExpression, accept: ValidationAcceptor): void {
        const item = inferType(unary.value, this.getTypeCache());
        if (!isLegalOperation(unary.operator, item)) {
            accept('error', `Cannot perform operation '${unary.operator}' on value of type '${typeToString(item)}'.`, {
                node: unary
            });
        }
    }

    private getTypeCache(): Map<AstNode, TypeDescription> {
        return new Map();
    }

}
