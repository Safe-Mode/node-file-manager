import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { EOL } from 'os';
import { createReadStream, constants } from 'node:fs';
import { argv, stdin, stdout } from 'node:process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const EQUAL_SIGN = '=';
const EXCLAMATION_SIGN = '!';
const SPACE_SIGN = ' ';
const GREETING_MESSAGE = 'Welcome to the File Manager';
const GRATITUDE_MESSAGE = 'Thank you for using File Manager';
const GOODBYE_MESSAGE = 'goodbye';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userNameArg = argv[2];
const userName = userNameArg.slice(userNameArg.indexOf(EQUAL_SIGN) + 1);
const greetingText = `${GREETING_MESSAGE}, ${userName}${EXCLAMATION_SIGN}`;
const goodbyeText = `${GRATITUDE_MESSAGE}, ${userName}, ${GOODBYE_MESSAGE}${EXCLAMATION_SIGN}`;

const fn = new Transform({
    transform(chunk, _, callback) {
        const commandStr = String(chunk).trim();
        const spaceIndex = commandStr.indexOf(SPACE_SIGN);
        const command = commandStr.slice(0, spaceIndex);
        const fileName = commandStr.slice(spaceIndex + 1);

        switch (command) {
            case 'cat':
                const url = new URL(`${__dirname}/${fileName}`);
                const readable = createReadStream(url.href);
                
                readable.on('data', (chunk) => {
                    callback(null, `${chunk}${EOL}`);
                });
                break;
            default:
                console.log(111);
                break;
        }
    }
});

const startJob = async () => {
    console.log(greetingText);
    
    await pipeline(
        stdin,
        fn,
        stdout
    );
};

process.on('SIGINT', () => {
    console.log(goodbyeText);
    process.exit(1);
});

startJob().catch(console.error);