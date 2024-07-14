/******************************************************************************
 * This file was generated by langium-cli 3.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import type { LangiumSharedCoreServices, LangiumCoreServices, LangiumGeneratedCoreServices, LangiumGeneratedSharedCoreServices, LanguageMetaData, Module } from 'langium';
import { FeflAstReflection } from './ast.js';
import { FeflGrammar } from './grammar.js';

export const FeflLanguageMetaData = {
    languageId: 'fefl',
    fileExtensions: ['.fefl'],
    caseInsensitive: false
} as const satisfies LanguageMetaData;

export const FeflGeneratedSharedModule: Module<LangiumSharedCoreServices, LangiumGeneratedSharedCoreServices> = {
    AstReflection: () => new FeflAstReflection()
};

export const FeflGeneratedModule: Module<LangiumCoreServices, LangiumGeneratedCoreServices> = {
    Grammar: () => FeflGrammar(),
    LanguageMetaData: () => FeflLanguageMetaData,
    parser: {}
};
