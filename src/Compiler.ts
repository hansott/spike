import Lexer from './Lexer';
import Parser from './Parser';
import { Program } from './Ast';
import { readFile } from 'fs';

class Compiler {
    compileFile(path: string) {
        return new Promise((resolve, reject) => {
            readFile(path, (err: NodeJS.ErrnoException, data: Buffer) => {
                if (err)  {
                    reject(err);
                }
                else {
                    const code = data.toString();
                    const program = this.compile(code);
                    resolve(program);
                }
            });
        });
    }
    compile(code: string): Program {
        const lexer = new Lexer();
        const parser = new Parser(lexer);
        return parser.parse(code);
    }
}

export default Compiler;

