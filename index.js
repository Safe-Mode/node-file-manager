import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { EOL, homedir } from 'os';
import { createReadStream, constants } from 'node:fs';
import { readdir, appendFile } from 'node:fs/promises';
import { argv, stdin, stdout, exit, cwd, chdir } from 'node:process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const EQUAL_SIGN = '=';
const EXCLAMATION_SIGN = '!';
const SPACE_SIGN = ' ';
const GREETING_MESSAGE = 'Welcome to the File Manager';
const GRATITUDE_MESSAGE = 'Thank you for using File Manager';
const GOODBYE_MESSAGE = 'goodbye';
const BREADCRUMBS_MESSAGE = 'You are currently in';
const INVALID_MESSAGE = 'Invalid input';
const Command = {
    EXIT: '.exit',
    LS: 'ls',
    CD: 'cd',
    UP: 'up',
    CAT: 'cat',
    ADD: 'add',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userNameArg = argv[2];
const userName = userNameArg.slice(userNameArg.indexOf(EQUAL_SIGN) + 1);
const greetingText = `${GREETING_MESSAGE}, ${userName}${EXCLAMATION_SIGN}`;
const goodbyeText = `${GRATITUDE_MESSAGE}, ${userName}, ${GOODBYE_MESSAGE}${EXCLAMATION_SIGN}`;

const logDirectory = async () => console.log(`${BREADCRUMBS_MESSAGE} ${cwd()}`);
const logGoodbye = () => console.log(goodbyeText);
const createFileUrl = (fileName) => `${cwd()}/${fileName}`;

const fn = new Transform({
    async transform(chunk, _, callback) {
        const commandStr = String(chunk).trim();
        const spaceIndex = commandStr.indexOf(SPACE_SIGN);
        const hasSpace = spaceIndex !== -1;
        const command = hasSpace ? commandStr.slice(0, spaceIndex) : commandStr;
        const fileName = commandStr.slice(spaceIndex + 1);

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
            default:
                console.log(INVALID_MESSAGE);
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