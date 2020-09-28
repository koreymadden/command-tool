require('colors');
const cp = require('child_process');
const fs = require('fs');
const readline = require('readline');
let tempConfig = null;
try {
    tempConfig = require('./config.json');
} catch (error) {
    console.log('please configure your config.json file by completing the prompts...\n'.yellow.underline);
}
const config = tempConfig;
const mira = (config) ? config.mira : null;
const eclipse = (config) ? config.eclipse : null;
const miraAndEclipse = (config) ? config.miraAndEclipse : null;
const userSetup = {};
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function start() {
    await question().then(async (input) => {
        await decipherInput(input).then(async (results) => {
            if ((results[1] === 'release' || results[1] === 'build') && results[0] !== null) startAppProcess(results[0], results[1]);
            return;
        });
    });
}

async function question() {
    const question = await new Promise((resolve, reject) => {
        interface.question("What app(s) would you like to build? \n".yellow.underline, async (userInput) => {
            const input = userInput.toLowerCase();
            resolve(input)
        })
    })
    return question;
}

async function decipherInput(input) {
    let command = null;
    let app = null;
    input = input.replace(/\s/g, '');
    input = input.replace(' and ', '');
    if (input.indexOf('release') !== -1) {
        command = 'release'
        input = input.replace('release', '');
    } else if (input.indexOf('build') !== -1) {
        command = 'build'
        input = input.replace('build', '');
    } else {
        command = 'build'
    }

    switch (input) {
        case 'mira':
        case 'm':
            app = 'mira';
            console.log('preparing', 'mira'.blue, command.cyan + '...');
            break;
        case 'eclipse':
        case 'e':
            app = 'eclipse'
            console.log('preparing', 'eclipse'.blue, command.cyan + '...');
            break;
        case 'miraeclipse':
        case 'eclipsemira':
        case 'both':
        case 'me':
        case 'em':
        case 'b':
            app = 'both';
            console.log('preparing', 'mira & eclipse'.blue, command.cyan + 's'.cyan + '...');
            break;
        case 'clear':
        case 'cls':
        case 'c':
            console.clear();
            start();
            break;
        case 'help':
        case 'h':
            console.table({
                help: {
                    command: "help | h",
                    description: "list of all commands available"
                },
                mira: {
                    command: "mira | m",
                    description: `build out the mira app from your "${mira}" folder`
                },
                eclipse: {
                    command: "eclipse | e",
                    description: `build out the eclipse app from your "${eclipse}" folder`
                },
                both: {
                    command: "both | b | m e | e m | mira eclipse | eclipse mira",
                    description: "build out both mira and eclipse"
                },
                release: {
                    command: "release + app",
                    description: "a modifier that creates a release .apk for desired app"
                },
                build: {
                    command: "build + app",
                    description: "a modifier that creates a build for the desired app (not necessary)"
                },
                config: {
                    command: "config | config.json",
                    description: "display all config.json data"
                },
                directory: {
                    command: "cwd",
                    description: "display the current working directory"
                },
                close: {
                    command: "close | exit | stop | kill | end",
                    description: "these commands will close the app"
                },
                setup: {
                    command: "setup",
                    description: "will allow you to reconfigure your config.json settings"
                },
                clean: {
                    command: "clean",
                    description: "updates your cleanView variable in your config.json"
                },
                clear: {
                    command: "clear | cls | c",
                    description: "clear the console"
                },
            });
            start();
            break;
        case 'cwd':
            console.log(process.cwd());
            start();
            break;
        case 'config':
            console.table(config);
            start();
            break;
        case 'close':
        case 'exit':
        case 'stop':
        case 'kill':
        case 'end':
            terminateCli();
            start();
            break;
        case 'clean':
            await getCleanView();
            console.log('your cleanView setting is now to:'.green, userSetup.cleanView.toString().magenta);
            terminateCli();
            start();
            break;
        case 'setup':
            console.log('start setup...');
            await setup();
            break;
        default:
            console.error(input.cyan, 'is not a valid input'.red);
            start();
            break;
    }
    return [app, command]
}

function startBuild(app, action, currentApp, displayName = null) {
    if (displayName === null) displayName = app;
    try {
        let [hour, minute, second] = getCurrentTime();
        console.log(displayName.blue, action.cyan, 'in', process.cwd().cyan, 'at', `${hour}:${minute}:${second}`.magenta);
        // run command
        let data = null;
        if (action === 'build') data = cp.execSync('cordova run android');
        if (action === 'release') data = cp.execSync('cordova build android --release');
        if (!config.cleanView) console.log(data.toString());
        // update time after build is finished
        [hour, minute, second] = getCurrentTime();
        switch (currentApp) {
            case mira:
                console.log('mira'.blue, action.cyan, 'finished with no errors'.green, 'at', `${hour}:${minute}:${second}`.magenta);
                break;
            case eclipse:
                console.log('eclipse'.blue, action.cyan, 'finished with no errors'.green, 'at', `${hour}:${minute}:${second}`.magenta);
                break;
            default:
                console.error(action.cyan, 'unknown finished with no errors'.red);
        }
        // can not get currentBranch to show both branches properly
        if (app !== 'both') console.log('current git branch:'.gray, branchName().cyan);
    } catch (error) {
        const shortMessage = (error.message.toLowerCase().indexOf("no emulator images") !== -1)
            ? '\nplease make sure your mobile device is connected to your computer'.red
            : ''
        if (!config.cleanView) console.error(error);
        console.log('error found'.red, shortMessage);
    }
}

function startAppProcess(app, action) {
    const appPath = getAppPath(app);

    // change to wanted path
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[0]}/client`);
        startBuild(app, action, appPath[0], 'mira');
    } else {
        process.chdir(`../${appPath}/client`);
        startBuild(app, action, appPath)
    }

    // change back to original directory
    process.chdir(`../../${miraAndEclipse}`);

    // build second app if both was chosen by user
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[1]}/client`);
        startBuild(app, action, appPath[1], 'eclipse');
        process.chdir(`../../${miraAndEclipse}`);
    }

    // tasks are finished and app should automatically start again
    start();
}

function getAppPath(app) {
    let appPath = null;
    if (app === 'mira') {
        appPath = mira;
    } else if (app === 'eclipse') {
        appPath = eclipse;
    } else if (app === 'both') {
        appPath = [mira, eclipse];
    }
    return appPath;
}

function releaseApp(app) {
    const appPath = getAppPath(app);
    
    // change to wanted path
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[0]}/client`);
        startBuild(app, action, appPath[0], 'mira');
    } else {
        process.chdir(`../${appPath}/client`);
        startBuild(app, action, appPath)
    }

    // change back to original directory
    process.chdir(`../../${miraAndEclipse}`);

    // build second app if both was chosen by user
    if (Array.isArray(appPath)) {
        process.chdir(`../${appPath[1]}/client`);
        startBuild(app, action, appPath[1], 'eclipse');
    }

    // tasks are finished and app should automatically start again
    start();
}

function getCurrentTime() {
    return (new Date()).toLocaleTimeString().slice(0, 7).split(":")
}

function branchName() {
    const branchName = require('current-git-branch');
    return branchName();
}

async function setup() {
    const getMiraName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'mira'.yellow} ${'repository?'.blue}\n`, async (userInput) => {
                userSetup.mira = userInput;
                resolve();
            })
        })
    }
    const getEclipseName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
                userSetup.eclipse = userInput;
                resolve();
            })
        })
    }
    const getMiraEclipseName = () => {
        return new Promise((resolve, reject) => {
            interface.question(`${'What is the name of your'.blue} ${'mira / eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
                userSetup.miraAndEclipse = userInput;
                resolve();
            })
        })
    }
    await getMiraName();
    await getEclipseName();
    await getMiraEclipseName();
    await getCleanView(true);
    fs.writeFileSync('./config.json', JSON.stringify({
        "mira": userSetup.mira,
        "eclipse": userSetup.eclipse,
        "miraAndEclipse": userSetup.miraAndEclipse,
        "cleanView": userSetup.cleanView
    }, null, '\t'));
    console.log('\nyou have successfully updated your config.json'.green);
    terminateCli();
}

function getCleanView(setup = false) {
    return new Promise((resolve, reject) => {
        interface.question(`Would you like ${'extra logs'.yellow} ${'to be displayed when using this app?'.blue} ${'(y/n)'.magenta}\n`.blue, userInput => {
            let input = false;
            if (userInput.toLowerCase() === 'n' || userInput.toLowerCase() === 'no') {
                input = true;
            }
            userSetup.cleanView = input;
            if (!setup) {
                fs.readFile('./config.json', function (error, data) {
                    let json = JSON.parse(data)
                    json.cleanView = userSetup.cleanView;
                    fs.writeFileSync("./config.json", JSON.stringify(json, null, '\t'));
                });
            }
            resolve();
        })
    })
}

function terminateCli() {
    // when the config.json is update and app restart is required to pull new data
    console.log('the app will close now...\nyou will need to start the app again to continue'.red);
    process.exit(25);
}

if (config) {
    start();
} else {
    setup();
}