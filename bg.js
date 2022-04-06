let on = false;
var browser;
const Browser = browser || chrome;

const getActiveTab = async () => browser ? tabFF() : tabChrome();

const tabFF = async () => {
    let [tab = {}] = await Browser.tabs.query({
        currentWindow: true,
        active: true
    });
    return tab;
};

const tabChrome = () => new Promise(resolve => {
    Browser.tabs.query({
        currentWindow: true,
        active: true
    }, ([tab]) => resolve(tab));
});

const toggle = async () => {
    let tab = await getActiveTab();
    on = !on;
    Browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE',
    })
    Browser.browserAction.setBadgeText({
        text: on ? 'on' : '',
        tabId: tab.id
    })
    Browser.browserAction.setBadgeBackgroundColor({
        color: on ? '#2e7d32' : 'rgba(0,0,0,0)',
        tabId: tab.id
    })
};


Browser.browserAction.onClicked.addListener(toggle)
