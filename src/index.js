import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { EOL, homedir } from 'os';
import { createReadStream, constants } from 'node:fs';
import { readdir, appendFile, rename } from 'node:fs/promises';
import { argv, stdin, stdout, exit, cwd, chdir } from 'node:process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { Sign, Command, Message } from './const.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userNameArg = argv[2];
const userName = userNameArg.slice(userNameArg.indexOf(Sign.EQUAL) + 1);
const greetingText = `${Message.GREETING}, ${userName}${Sign.EXCLAMATION}`;
const goodbyeText = `${Message.GRATITUDE}, ${userName}, ${Message.GOODBYE}${Sign.EXCLAMATION}`;

const logDirectory = async () => console.log(`${Message.BREADCRUMBS} ${cwd()}`);
const logGoodbye = () => console.log(goodbyeText);
const createFileUrl = (fileName) => `${cwd()}/${fileName}`;

const fn = new Transform({
    async transform(chunk, _, callback) {
        const commandStr = String(chunk).trim();
        const spaceIndex = commandStr.indexOf(Sign.SPACE);
        const hasSpace = spaceIndex !== -1;
        const command = hasSpace ? commandStr.slice(0, spaceIndex) : commandStr;
        let fileName = hasSpace ? commandStr.slice(spaceIndex + 1) : '';

        switch (command) {
            case Command.EXIT:
                exit(1);
            case Command.LS:
                const dir = await readdir(cwd(), { withFileTypes: true });

                const sorted = dir
                        .map((entity) => ({
                            Name: entity.name,
                            Type: entity.isDirectory() ? 'directory' : 'file'
                        }))
                        .sort((prev, next) => prev.Type === 'directory' ?
                            -1 : next.Type === 'directory' ?
                                1 : 0);

                console.table(sorted);
                callback();

                break;
            case Command.CD:
                chdir(fileName);
                callback();

                break;
            case Command.UP:
                chdir('../');
                callback();

                break;
            case Command.CAT:
                const url = createFileUrl(fileName);
                const readable = createReadStream(url);
                
                readable.on('data', (chunk) => {
                    callback(null, `${chunk}${EOL}`);
                });

                break;
            case Command.ADD:
                const fileUrl = createFileUrl(fileName);

                appendFile(fileUrl, '');
                callback();

                break;
            case Command.RN:
                const nextSpaceIndex = commandStr.indexOf(Sign.SPACE, spaceIndex + 1);
                const newFileName = commandStr.slice(nextSpaceIndex + 1);
                
                fileName = commandStr.slice(spaceIndex + 1, nextSpaceIndex);
                rename(createFileUrl(fileName), createFileUrl(newFileName));
                callback();

                break;
            default:
                console.log(Message.INVALID);
                callback();
                break;
        }

        logDirectory();
    }
});

const startJob = async () => {
    console.log(greetingText);
    chdir(homedir());
    logDirectory();

    await pipeline(
        stdin,
        fn,
        stdout
    );
};

process.on('SIGINT', exit);
process.on('exit', logGoodbye);

startJob().catch(console.error);