#!/usr/bin/env node
import Compiler from '../src/Compiler';
import { inspect } from 'util';

const compiler = new Compiler;
compiler.compileFile('./spec.spike').then((program) => {
    console.log(inspect(program, {showHidden: true, depth: null, colors: true}));
});
