import Compiler from '../src/Compiler';
import { inspect } from 'util';
import { Program } from '../src/Ast';
import { join, dirname, basename } from 'path';
import { writeFile } from 'fs';

if (!process.argv[2]) {
    console.error('🤷‍♂️  No file path given to compile.');
    process.exit(1);
}

const absolutePath = join(process.cwd(), process.argv[2]);
const showAst = process.argv.indexOf('--ast') > -1;
const compiler = new Compiler;

compiler.compileFile(absolutePath)
    .then((program: Program) => {
        if (showAst) {
            console.log(inspect(program, {showHidden: true, depth: null, colors: true}));
            process.exit(0);
        }
        const dir = dirname(absolutePath);
        const jsPath = basename(absolutePath, '.spike') + '.js';
        const compiledPath = join(dir, jsPath);
        const js = program.toJavaScript().join("\n");
        writeFile(compiledPath, js, (err) => {
            if (err) throw err;
            console.log(`🚀  Compiled! Wrote file ${jsPath}.`);
        });
    })
    .catch(error => {
        console.error('🔥  Houston, we have a problem.');
        console.error(error.toString());
    });
