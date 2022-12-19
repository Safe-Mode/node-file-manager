import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { EOL, homedir, cpus, userInfo, arch } from 'os';
import { createReadStream, createWriteStream, constants } from 'node:fs';
import { readdir, appendFile, rename, rm } from 'node:fs/promises';
import { argv, stdin, stdout, exit, cwd, chdir } from 'node:process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { Sign, Command, Message, EntityType, OsParams } from './const.js';

const ROUND_PRECISION = 2;
const CPU_RATE_DIVIDER = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userNameArg = argv[2];
const userName = userNameArg.slice(userNameArg.indexOf(Sign.EQUAL) + 1);
const greetingText = `${Message.GREETING}, ${userName}${Sign.EXCLAMATION}`;
const goodbyeText = `${Message.GRATITUDE}, ${userName}, ${Message.GOODBYE}${Sign.EXCLAMATION}`;

const round = (num, precision) => {
    const modifier = 10 ** precision;
    return Math.round(num * modifier) / modifier;
};

const logDirectory = async () => console.log(`${Message.BREADCRUMBS} ${cwd()}`);
const logGoodbye = () => console.log(goodbyeText);
const getFileUrl = (fileName) => `${cwd()}/${fileName}`;
const deleteFile = (fileName, callback) => rm(getFileUrl(fileName)).then(callback);

const copyFile = (fileName, newDest, callback) => {
    const cpUrl = getFileUrl(fileName);
    const cpNewUrl = getFileUrl(`${newDest}/${fileName}`);
    const cpReadable = createReadStream(cpUrl);
    const cpWritable = createWriteStream(cpNewUrl);

    cpReadable.pipe(cpWritable);
    callback();
};

const fn = new Transform({
    async transform(chunk, _, callback) {
        const commandStr = String(chunk).trim();
        const spaceIndex = commandStr.indexOf(Sign.SPACE);
        const hasSpace = spaceIndex !== -1;
        const command = hasSpace ? commandStr.slice(0, spaceIndex) : commandStr;
        const nextSpaceIndex = commandStr.indexOf(Sign.SPACE, spaceIndex + 1);
        const hasNextSpace = nextSpaceIndex !== -1;
        let fileName = hasNextSpace ?
                commandStr.slice(spaceIndex + 1, nextSpaceIndex) :
                hasSpace ?
                    commandStr.slice(spaceIndex + 1) :
                    '';
        let newDest = hasNextSpace ? commandStr.slice(nextSpaceIndex + 1) : '';

        switch (command) {
            case Command.EXIT:
                exit(1);
            case Command.LS:
                const dir = await readdir(cwd(), { withFileTypes: true });

                const sorted = dir
                        .map((entity) => ({
                            Name: entity.name,
                            Type: entity.isDirectory() ? EntityType.DIR : EntityType.FILE
                        }))
                        .sort((prev, next) => prev.Type === EntityType.DIR ?
                            -1 : next.Type === EntityType.DIR ?
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
                const catUrl = getFileUrl(fileName);
                const catReadable = createReadStream(catUrl);
                
                catReadable.on('data', (chunk) => {
                    callback(null, `${chunk}${EOL}`);
                });

                break;
            case Command.ADD:
                const fileUrl = getFileUrl(fileName);

                appendFile(fileUrl, '');
                callback();

                break;
            case Command.RN:
                fileName = commandStr.slice(spaceIndex + 1, nextSpaceIndex);
                rename(getFileUrl(fileName), getFileUrl(newDest));
                callback();

                break;
            case Command.CP:
                copyFile(fileName, newDest, callback);
                break;
            case Command.MV:
                const deleteFileAndExecCb = () => deleteFile(fileName, callback);
                copyFile(fileName, newDest, deleteFileAndExecCb);
                break;
            case Command.RM:
                deleteFile(fileName, callback);
                break;
            case Command.OS:
                switch (fileName) {
                    case OsParams.EOL:
                        console.log(JSON.stringify(EOL));
                        break;
                    case OsParams.CPUS:
                        const cpuInfo = cpus().map((core) => ({
                            Model: core.model,
                            'Clock Rate (GHz)': round(core.speed / CPU_RATE_DIVIDER, ROUND_PRECISION)
                        }));

                        console.table(cpuInfo);
                        break;
                    case OsParams.HOMEDIR:
                        console.log(homedir());
                        break;
                    case OsParams.USERNAME:
                        console.log(userInfo().username);
                        break;
                    case OsParams.ARCH:
                        console.log(arch());
                        break;
                    default:
                        break;
                }

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