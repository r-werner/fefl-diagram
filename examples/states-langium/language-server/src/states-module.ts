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

const ElkConstructor = require('elkjs/lib/elk.bundled.js').default;
import { inject, Module } from 'langium';
import { createDefaultModule, createDefaultSharedModule, PartialLangiumServices, DefaultSharedModuleContext } from 'langium/lsp';
import { LangiumSprottyServices, LangiumSprottySharedServices, SprottyDefaultModule, SprottyDiagramServices, SprottySharedModule } from 'langium-sprotty';
import { DefaultElementFilter, ElkFactory, ElkLayoutEngine, IElementFilter, ILayoutConfigurator } from 'sprotty-elk/lib/elk-layout.js';
import { StatesDiagramGenerator } from './diagram-generator.js';
import { FeflGeneratedModule, FeflGeneratedSharedModule } from './generated/module.js';
import { StatesLayoutConfigurator } from './layout-config.js';
// import { registerValidationChecks, StatesValidator } from './states-validator.js';
// import { StatesCodeActionProvider } from './code-actions.js';
import { LoxScopeProvider } from './lox-scope.js';

import { LoxValidationRegistry, StatesValidator } from './states-validator.js';
import { LoxHoverProvider } from './lox-hover-provider.js';


/**
 * Declaration of custom services - add your own service classes here.
 */
export type StatesAddedServices = {
    validation: {
        StatesValidator: StatesValidator
    },
    layout: {
        ElkFactory: ElkFactory,
        ElementFilter: IElementFilter,
        LayoutConfigurator: ILayoutConfigurator
    }
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type StatesServices = LangiumSprottyServices & StatesAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const StatesModule: Module<StatesServices, PartialLangiumServices & SprottyDiagramServices & StatesAddedServices> = {
    diagram: {
        DiagramGenerator: services => new StatesDiagramGenerator(services),
        ModelLayoutEngine: services => new ElkLayoutEngine(services.layout.ElkFactory, services.layout.ElementFilter, services.layout.LayoutConfigurator) as any
    },
    validation: {
        ValidationRegistry: (services) => new LoxValidationRegistry(services),
        StatesValidator: () => new StatesValidator()
    },
    references: {
        ScopeProvider: (services) => new LoxScopeProvider(services)
    },
    layout: {
        ElkFactory: () => () => new ElkConstructor({ algorithms: ['layered'] }),
        ElementFilter: () => new DefaultElementFilter,
        LayoutConfigurator: () => new StatesLayoutConfigurator
    },
    lsp: {
        // CodeActionProvider: () => new StatesCodeActionProvider(),
        HoverProvider: (services) => new LoxHoverProvider(services)
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createStatesServices(context: DefaultSharedModuleContext): {
    shared: LangiumSprottySharedServices,
    states: StatesServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        FeflGeneratedSharedModule,
        SprottySharedModule
    );
    const states = inject(
        createDefaultModule({ shared }),
        FeflGeneratedModule,
        SprottyDefaultModule,
        StatesModule
    );
    // registerValidationChecks(states);
    shared.ServiceRegistry.register(states);
    return { shared, states };
}
