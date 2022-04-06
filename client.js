class View extends EventTarget {
    constructor({ id = '', ctrl }) {
        super();
        this._id = id;
        this._dom = this._initDOM(id);
        this._initListener();
        this._ctrl = ctrl;
    }

    _initDOM(id) {
        return document.createElement('i');
    }

    _initListener() {}

    get dom() {
        return this._dom;
    }

    get id() {
        return this._id;
    }

    dispatch(event) {
        return this._ctrl.dispatchEvent.call(this._ctrl, event);
    }
}

class CtrlView extends View {
    constructor(props) {
        super(props);
    }

    _initDOM(id) {
        const section = document.createElement('section');
        section.id = id;
        section.style.top = 0;
        section.style.right = 0;
        section.innerHTML = `
            <style>
                .hopps-scroll {
                    scroll-behavior: smooth;
                }
                #hopps.show {
                    display: flex;
                }
                #hopps,
                #hopps > *,
                #hoops * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                #hopps {
                    position: fixed;
                    z-index: 9999 !important;
                    padding: 16px;
                    max-width: 50vw;
                    max-height: 100vh;
                    overflow: hidden;
                    background: rgba(0, 0, 0, 0.6);
                    -webkit-backdrop-filter: blur(1.2px);
                    backdrop-filter: blur(1.2px);
                    border-radius: 2px;
                    display: none;
                    flex-direction: column;
                    // filter: invert(1) hue-rotate(.5turn);
                }
                #hopps > * {
                    flex: 1 auto;
                }
                #hopps li,
                #hopps a {
                    color: inherit;
                    line-height: 1.4em;
                    list-style: none;
                }
                #hopps-nav {
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                #hopps-nav small {
                    color: gray;
                    margin-right: 4px;
                }
                #hopps-nav li {
                    list-style: none;
                    padding-left: 8px;
                    margin: 0;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
                #hopps .hopps-lv1 {
                    color: white;
                    font-size: 15px;
                    font-weight: 500;
                }
                #hopps .hopps-lv2 {
                    color: lightyellow;
                    font-size: 14px;
                    font-weight: 400;
                }
                #hopps .hopps-lv3 {
                    color: lightcyan;
                    font-size: 13px;
                    font-weight: 300;
                    border-left: 1px solid lightcyan;
                }
                #hopps .hopps-lv4 {
                    color: lightsteelblue;
                    font-size: 12px;
                    font-weight: 300;
                    border-left: 1px solid lightsteelblue;
                }
                #hopps-nav li.active {
                    background: #d32f2f;
                }
                .hopps-highlight {
                    outline: 1px solid red;
                    background: rgba(255, 0, 0, 0.1);
                }
                #hopps-level {
                    display: flex;
                    flex-wrap: nowrap;
                    padding-right: 50px;
                    margin-top: 24px;
                    font-size: 13px;
                }
                #hopps-level .lv-selector {
                    flex: 1 auto;
                    border: 1px solid white;
                }
                .lv-selector label {
                    display: block;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    cursor: pointer;
                    opacity: 0.2;
                    line-height: 1em;
                }
                .lv-selector input {
                    display: none;
                }
                .lv-selector input:checked + label {
                    opacity: 0.8;
                }
                .lv-selector.lv1 label {
                    background: white;
                }
                .lv-selector.lv2 label {
                    background: lightyellow;
                }
                .lv-selector.lv3 label {
                    background: lightcyan;
                }
                .lv-selector.lv4 label {
                    background: lightsteelblue;
                }
                #hopps .pos-btn {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    transform: rotate(45deg);
                    background: rgba(0,0,0,0.4);
                    cursor: pointer;
                    border: none;
                }
                .pos-btn:hover {
                    background: rgba(0,0,0,0.8);
                }
                .pos-btn.top {
                    top: -15px;
                }
                .pos-btn.left {
                    left: -15px;
                }
                .pos-btn.right {
                    right: -15px;
                }
                .pos-btn.bottom {
                    bottom: -15px;
                }
                #hopps-area {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                }
            </style>
        `;
        section.append(
            this._createPosBtn(['top', 'left']),
            this._createPosBtn(['top', 'right']),
            this._createPosBtn(['bottom', 'left']),
            this._createPosBtn(['bottom', 'right']),
        );
        return section;
    }

    _createPosBtn(pos = ['top', 'left']) {
        const btn = document.createElement('button');
        btn.className = `pos-btn ${pos.join(' ')}`;
        btn.addEventListener('click', evt => {
            this.dom.style = '';
            [...evt.target.classList].forEach(key => {
                this.dom.style[key] = 0;
            })
        });
        return btn;
    }

    toggle() {
        const show = this.dom.classList.toggle('show');
        [...document.querySelectorAll('html,body')].forEach(
            node => node.classList.toggle('hopps-scroll', show)
        );
    }

    start() {
        this.dispatchEvent(new CustomEvent(AreaView.UPDATE_ROOT, {
            detail: { root: document.body },
        }));
    }
}

class NavView extends View {
    static filter(input = []) {
        return input.filter(
            item => item.textContent !== ''
                && item.clientWidth > 1
                && item.clientHeight > 1
                && !!item.getClientRects(),
        )
    }
    static getLvs(nodes = []) {
        return [...new Set(nodes.map(node => node.tagName.toLowerCase()))].sort();
    }
    static createEmptyList(msg = '') {
        const div = document.createElement('div');
        const em = document.createElement('em');
        em.textContent = msg;
        div.appendChild(em);
        return { list: div, headlines: [] };
    }

    constructor(props) {
        super(props);
    }

    _initDOM(id) {
        const ul = document.createElement('ul');
        ul.id = id;
        return ul;
    }

    _createItem({ lv = 0, headline = {}, ids = [] }) {
        const li = document.createElement("li");
        li.className = `hopps-lv${lv}`;
        li.dataset.tag = headline.tagName.toLowerCase();
        li.style.marginLeft = `${(lv - 1) * 16}px`;
        const small = document.createElement('small');
        small.textContent = ids.join('.');
        const a = document.createElement('a');
        a.href = `#${headline.id}`;
        a.textContent = headline.textContent;
        a.prepend(small);
        li.appendChild(a);
        return li;
    };

    _createList({ root, pick }) {
        if (!pick.length) {
            return NavView.createEmptyList('Pick 1 level.');
        }
        const hl = [...root.querySelectorAll(pick.join(','))];
        if (!hl.length) {
            return NavView.createEmptyList('No headlines.');
        }
        const headlines = NavView.filter(hl);
        const lvs = NavView.getLvs(headlines);
        const counter = lvs.map(_ => 0);
        const list = headlines.reduce((memo, headline) => {
            const lv = lvs.indexOf(headline.tagName.toLowerCase());
            let i = lvs.length;
            while (--i > -1) {
                if (i > lv) {
                    counter[i] = 0;
                } else if (i === lv) {
                    counter[i]++;
                } else {
                    if (counter[i] !== 0) {
                        continue;
                    }
                    counter[i]++;
                }
            }
            const ids = counter.filter(num => !!num);
            headline.id ||= ids.join('-');
            memo.appendChild(
                this._createItem({ lv: ids.length, headline, ids }),
            );
            return memo;
        }, document.createDocumentFragment());
        return {
            list,
            headlines,
        };
    }

    update(props) {
        const { list, headlines } = this._createList(props);
        this.dom.textContent = '';
        this.dom.appendChild(list);
        return headlines;
    }
}

class AreaView extends View {
    static UPDATE_ROOT = 'UPDATE_ROOT'
    static hlClass = 'hopps-highlight'

    constructor(props) {
        super(props);
        this._exclude = props.exclude;
    }

    _initDOM(id) {
        const div = document.createElement('div');
        div.id = id;
        div.innerHTML = `<button id="reselect-btn" title="select area">「」</button>`;
        return div;
    }

    _initListener() {
        this._highlight = this._highlight.bind(this);
        this._onStart = this._onStart.bind(this);
        this._onEnd = this._onEnd.bind(this);
        this._confirm = this._confirm.bind(this);
        const btn = this.dom.querySelector('#reselect-btn');
        btn.addEventListener('click', this._onStart);
    }

    _onStart() {
        document.addEventListener('mouseenter', this._highlight, true);
        document.addEventListener('click', this._confirm, true);
    }

    _onEnd() {
        document.removeEventListener('mouseenter', this._highlight, true);
        document.removeEventListener('click', this._confirm, true);
    }

    _highlight(evt) {
        if (this._exclude.contains(evt.target)) {
            return;
        }
        [...document.querySelectorAll('html *')].forEach(
            node => node?.classList?.remove(AreaView.hlClass),
        );
        evt.target?.classList?.add(AreaView.hlClass);
    }

    _confirm() {
        this._onEnd();
        const nextRoot = document.querySelector(`.${AreaView.hlClass}`);
        if (window.confirm('Find headlines in this area?')) {
            this.dispatch(new CustomEvent(AreaView.UPDATE_ROOT, {
                detail: { root: nextRoot },
            }));
        }
        nextRoot?.classList?.remove(AreaView.hlClass);
    }
}

class ScrollView extends View {
    constructor(props) {
        super(props);
        this._onScroll = () => {};
    }

    update({ headlines }) {
        const nav = document.querySelector('#hopps #hopps-nav');
        document.removeEventListener("scroll", this._onScroll);
        this._onScroll = evt => {
            const activeID = this._findActive(headlines);
            this._updateActive(activeID, nav);
        };
        document.addEventListener("scroll", this._onScroll);
    }

    _updateActive(id, nav) {
        [...nav.querySelectorAll("a")].forEach(node => {
            const [, match] = node.href.match(/[^#]*#([^#]*)$/) || [];
            if (match === id) {
                node.parentNode.classList.add('active');
            } else {
                node.parentNode.classList.remove('active');
            }
        });
    }

    _findActive(headlines) {
        const { height } = window.screen;
        let activeID = null;
        const info = headlines.map(node => [node.id, node.getClientRects()?.[0] || {}]);
        info.some(([id, rect]) => {
            const { top, bottom } = rect;
            if (bottom >= 0 && top < height) {
                activeID = id;
                return true;
            }
            return false;
        });
        if (activeID === null) {
            const [nextID] = info
                .map(([id, rect]) => [id, (rect.bottom < 0 ? rect.bottom : -Number.MAX_VALUE)])
                .reduce((memo, item) => {
                    return (item[1] > memo[1]
                    ? item
                    : memo
                )}, [null, -Number.MAX_VALUE]);
            activeID = nextID
        }
        return activeID;
    }
}

class LevelView extends View {
    static LV_SELECTED = 'LV_SELECTED'

    constructor(props) {
        super(props);
    }

    _initDOM(id) {
        const ol = document.createElement('ol');
        ol.id = id;
        return ol;
    }

    _initListener() {
        this._onFilter = this._onFilter.bind(this);
        this.dom.addEventListener('click', this._onFilter);
    }

    _onFilter(event) {
        const lv = [...event.currentTarget.querySelectorAll('input')]
            .filter(node => !!node.checked).map(node => node.name);
        this.dispatch(new CustomEvent(LevelView.LV_SELECTED, {
            detail: { lv },
        }));
    }

    update({ headlines }) {
        this.dom.textContent = '';
        const lvs = NavView.getLvs(headlines);
        const items = lvs.map((tag, index) => {
            const lv = index + 1;
            return `
                <li class="lv-selector lv${lv}">
                    <input id="${tag}" name="${tag}" type="checkbox" checked />
                    <label for="${tag}">${lv}</label>
                </li>
            `;
        });
        this.dom.innerHTML = items.join('');
    }
}

(() => {
    try {
        var browser;
        const Browser = browser || chrome;
        let root = document.querySelector('body');
        const pick = ['h1', 'h2', 'h3', 'h4'];

        const ctrl = new CtrlView({ id: 'hopps' });
        const nav = new NavView({ id: 'hopps-nav', ctrl });
        const area = new AreaView({ id: 'hopps-area', ctrl, exclude: ctrl.dom });
        const level = new LevelView({ id: 'hopps-level', ctrl });
        const scroll = new ScrollView({ id: 'hopps-scroll', ctrl });
        ctrl.addEventListener(AreaView.UPDATE_ROOT, ({ detail }) => {
            root = detail.root;
            const headlines = nav.update({ root, pick });
            scroll.update({ headlines });
            level.update({ headlines });
        }, false, true);
        ctrl.addEventListener(LevelView.LV_SELECTED, ({ detail }) => {
            const headlines = nav.update({ root, pick: detail.lv });
            scroll.update({ headlines });
        }, false, true);
        ctrl.dom.append(
            nav.dom,
            level.dom,
            area.dom,
            scroll.dom,
        );
        document.querySelector(`#${ctrl.id}`)?.remove();
        document.body.appendChild(ctrl.dom);
        ctrl.start();

        Browser.runtime.onMessage.addListener(req => {
            if (req.type === 'TOGGLE') {
                ctrl.toggle();
            }
        });
    } catch (err) {
        console.log('[ERROR]', err);
    }
})();
