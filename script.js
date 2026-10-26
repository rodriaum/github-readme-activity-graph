const elements = {
    toggleBtn: document.querySelector('.toggle-btn'),
    bgColor: document.querySelector('.bg-color'),
    loader: document.querySelector('.loader'),
    placeholder: document.querySelector('.chart_placeholder'),
    copyContainer: document.querySelector('.copy_container'),
    textArea: document.querySelector('.text'),
    copyText: document.querySelector('.copy_text'),
    submitButton: document.getElementById('submit-button'),
    username: document.getElementById('username'),
    entityType: document.getElementById('entityType'),
    themeSelect: document.getElementById('themeSelect'),
};
// Theme definitions
const themes = {
    default: { bgColor: '#ffcfe9', line: '#9e4c98', point: '#403d3d', color: '#9e4c98' },
    github: { bgColor: '#293036', line: '#9ecbff', point: '#f97583', color: '#ffffff' },
    'github-light': { bgColor: '#ffffff', line: '#9be9a8', point: '#40c463', color: '#000000' },
    'github-compact': { bgColor: '#00000000', line: '#26a641', point: '#8b949e', color: '#8b949e' },
    'github-dark': { bgColor: '#0D1117', line: '#1F6FEB', point: '#58A6FF', color: '#58A6FF' },
    'github-dark-dimmed': {
        bgColor: '#24292F',
        line: '#ADBAC7',
        point: '#539bf5',
        color: '#ADBAC7',
    },
    dracula: { bgColor: '#44475a', line: '#ff79c6', point: '#bd93f9', color: '#f8f8f2' },
    gruvbox: { bgColor: '#504945', line: '#d8a657', point: '#e78a4e', color: '#d4be98' },
    gotham: { bgColor: '#0c1014', line: '#599cab', point: '#99d1ce', color: '#2aa889' },
    rogue: { bgColor: '#172030', line: '#b18bb1', point: '#c6797e', color: '#a3b09a' },
    xcode: { bgColor: '#202124', line: '#c4e3ff', point: '#ff8070', color: '#fcfcfa' },
    radical: { bgColor: '#141321', line: '#fe428e', point: '#f8d847', color: '#a9fef7' },
    coral: { bgColor: '#9a3838', line: '#f4e23d', point: '#f4e7e7', color: '#f9fae9' },
    react: { bgColor: '#282c34', line: '#61dafb', point: '#61dafb', color: '#ffffff' },
    'react-dark': { bgColor: '#0d1117', line: '#5bcdec', point: '#ffffff', color: '#5bcdec' },
    nord: { bgColor: '#2e3440', line: '#88c0d0', point: '#ffffff', color: '#88c0d0' },
    lucent: { bgColor: '#cccccc', line: '#ffd369', point: '#faf3e0', color: '#000000' },
    'chartreuse-dark': { bgColor: '#000000', line: '#00adfe', point: '#7ffe00', color: '#7ffe00' },
    minimal: { bgColor: '#ffffff', line: '#d3e6fa', point: '#3f99ed', color: '#000000' },
    'shadcn-white': { bgColor: '#FFFFFF', line: '#18181B', point: '#18181B', color: '#09090B' },
    'shadcn-dark': { bgColor: '#09090B', line: '#FAFAFA', point: '#FAFAFA', color: '#FAFAFA' },
    'material-palenight': {
        bgColor: '#292d3e',
        line: '#c792ea',
        point: '#89ddff',
        color: '#a6accd',
    },
    green: { bgColor: '#dad7cd', line: '#588157', point: '#344e41', color: '#3a5a40' },
    'noctis-minimus': { bgColor: '#1b2932', line: '#72b7c0', point: '#c5cdd3', color: '#d3b692' },
    'one-dark': { bgColor: '#282C34', line: '#e5c17c', point: '#e06c75', color: '#abb2bf' },
    monokai: { bgColor: '#2D2A2E', line: '#ff6188', point: '#ffd866', color: '#fcfcfa' },
    elegant: { bgColor: '#161e2d', line: '#fb8500', point: '#42002b', color: '#d8d5d5' },
    aqua: { bgColor: '#52b69a', line: '#226d64', point: '#156f69', color: '#187177' },
    'synthwave-84': { bgColor: '#2C223B', line: '#F7F645', point: '#22E5F4', color: '#FF3CA2' },
    merko: { bgColor: '#0a0f0b', line: '#abd200', point: '#f6f8fa', color: '#f6f8fa' },
    vue: { bgColor: '#2c3e50', line: '#41b883', point: '#f6f8fa', color: '#41b883' },
    'tokyo-day': { bgColor: '#e5e8d8', line: '#8f5a02', point: '#562e49', color: '#8f5a02' },
    'tokyo-night': { bgColor: '#1a1b27', line: '#70a5fd', point: '#a9b1d6', color: '#70a5fd' },
    'high-contrast': { bgColor: '#000000', line: '#e7e7e7', point: '#e7e7e7', color: '#e7e7e7' },
    cobalt: { bgColor: '#193549', line: '#d19a66', point: '#e7e7e7', color: '#d19a66' },
    material: { bgColor: '#263238', line: '#80cbc4', point: '#ffab91', color: '#80cbc4' },
    nightowl: { bgColor: '#011627', line: '#c792ea', point: '#ffeb95', color: '#c792ea' },
    'modern-lilac': { bgColor: '#0a0e12', line: '#5d417a', point: '#fab795', color: '#5d417a' },
    arctic: { bgColor: '#03203C', line: '#5DA3FA', point: '#2827CC', color: '#5DA3FA' },
};
// Handle theme selection
const onThemeChange = () => {
    const selected = elements.themeSelect.value;
    const theme = themes[selected] || themes.default;
    // Update color pickers
    inputElements.bgInput.value = theme.bgColor;
    inputElements.lineInput.value = theme.line;
    inputElements.pointInput.value = theme.point;
    inputElements.ltgInput.value = theme.color;
    // Update valueToCopy
    valueToCopy.bgColor = theme.bgColor;
    valueToCopy.line = theme.line;
    valueToCopy.point = theme.point;
    valueToCopy.color = theme.color;
    // Update UI colors
    changeBgColor();
    changeLineColor();
    changeLabelsAndGridColor();
    changePointColor();
};

const inputElements = {
    bgInput: document.getElementById('bgColor'),
    lineInput: document.getElementById('line'),
    ltgInput: document.getElementById('color'),
    pointInput: document.getElementById('point'),
};

const valueToCopy = {
    username: '',
    bgColor: '#ffcfe9',
    color: '#9e4c98',
    line: '#9e4c98',
    point: '#403d3d',
};

/*-----------------------------------------
        Fetch user's contribution data
        and generate graph link
-------------------------------------------*/

//For displaying loading animation

const setLoader = () => {
    elements.loader.classList.add('active');
};
const removeLoader = () => {
    elements.loader.classList.remove('active');
};

const removePlaceholder = () => {
    elements.placeholder.classList.remove('active');
    elements.copyContainer.style.marginTop = '2rem';
};

// Generate chart link with user data

const generateLink = () => {
    const isOrganization = elements.entityType.value === 'organization';
    const parameter = isOrganization ? 'organization' : 'username';
    const label = isOrganization ? `${valueToCopy.username} organization activity graph` : `${valueToCopy.username}'s GitHub activity graph`;
    const profileUrl = `https://github.com/${valueToCopy.username}`;
    const link = `[![${label}](https://github-act-graph.rodriaum.com/graph?${parameter}=${encodeURIComponent(valueToCopy.username)}&bg_color=${valueToCopy.bgColor.slice(1)}&color=${valueToCopy.color.slice(1)}&line=${valueToCopy.line.slice(1)}&point=${valueToCopy.point.slice(1)}&area=true&hide_border=true)](${profileUrl})`;
    elements.textArea.value = link;
    elements.copyText.childNodes[3].style.backgroundColor = 'rgb(87, 132, 245)';
    return link;
};

// Fetch user data and create graph

const getGraph = (username, type) => {
    // Graph Configuration

    const options = {
        height: 380,
        axisY: {
            title: 'Contributions',
            onlyInteger: true,
            offset: 70,
            labelOffset: {
                y: 4.5,
            },
        },
        axisX: {
            title: 'Days',
            offset: 50,
            labelOffset: {
                x: -4.5,
            },
        },
        chartPadding: {
            top: 80,
            right: 50,
            bottom: 20,
            left: 20,
        },
        showArea: true,
        fullWidth: true,
        plugins: [
            Chartist.plugins.ctAxisTitle({
                axisX: {
                    axisTitle: 'Days',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 50,
                    },
                    textAnchor: 'middle',
                },
                axisY: {
                    axisTitle: 'Contributions',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 50,
                    },
                    textAnchor: 'middle',
                    flipTitle: true,
                },
            }),
        ],
    };

    axios({
        url: `https://github-act-graph.rodriaum.com/data?${type === 'organization' ? 'organization' : 'username'}=${encodeURIComponent(username)}`,
        method: 'GET',
    })
        .then((contributionData) => {
            const days = contributionData.data.contributions;
            const data = {
                labels: days.map((day) => day.date),
                series: [{ value: days.map((day) => day.contributionCount) }],
            };

            document.querySelector('.ct-chart').innerHTML = '';
            new Chartist.Line('.ct-chart', data, options);

            removeLoader();
            removePlaceholder();
            generateLink();
        })
        .catch((err) => {
            console.error(err);
            removeLoader();
            alert('Sorry! something went wrong.');
        });
};

// Handle submit button
const onSubmit = (event) => {
    event.preventDefault();

    //get username
    const username = elements.username.value;
    if (username.length > 0) {
        valueToCopy.username = username.trim();
        setLoader();
        getGraph(valueToCopy.username, elements.entityType.value);
    } else {
        alert('Enter a GitHub username or organization name');
        return;
    }
};

/*-----------------------------------------
                Dark Theme
-------------------------------------------*/

let darkMode = localStorage.getItem('darkMode');

const enableDarkMode = () => {
    elements.bgColor.classList.add('active');
    localStorage.setItem('darkMode', 'enabled');
};
const disableDarkMode = () => {
    elements.bgColor.classList.remove('active');
    localStorage.setItem('darkMode', '');
};
if (darkMode === 'enabled') {
    enableDarkMode();
}

const handleDarkMode = () => {
    darkMode = localStorage.getItem('darkMode');

    if (darkMode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
};

//Dynamic changes

// Background Color
const changeBgColor = () => {
    valueToCopy.bgColor = inputElements.bgInput.value;
    document.querySelector('.rect').style.backgroundColor = inputElements.bgInput.value;
    generateLink();
};

// Line Color
const changeLineColor = () => {
    valueToCopy.line = inputElements.lineInput.value;
    document.querySelector('.ct-line').style.stroke = inputElements.lineInput.value;
    generateLink();
};

//Lables, Title and Grid color
const changeLabelsAndGridColor = () => {
    const ltgValue = inputElements.ltgInput.value;
    valueToCopy.color = ltgValue;

    const allLables = document.querySelectorAll('.ct-label');
    const axisTitles = document.querySelectorAll('.ct-axis-title');
    const grids = document.querySelectorAll('.ct-grid');

    allLables.forEach((el) => {
        el.style.fill = ltgValue;
        el.style.color = ltgValue;
    });

    axisTitles.forEach((el) => {
        el.style.fill = ltgValue;
    });
    grids.forEach((el) => {
        el.style.stroke = ltgValue;
    });

    generateLink();
};

// Point Color
const changePointColor = () => {
    valueToCopy.point = inputElements.pointInput.value;
    const allPointLables = document.querySelectorAll('.ct-point');
    const len = allPointLables.length;
    for (let idx = 0; idx < len; idx++) {
        allPointLables[idx].style.stroke = inputElements.pointInput.value;
    }
    generateLink();
};

// Copy to clipboard
const copyLink = () => {
    if (elements.textArea.value !== '') {
        let copyBtn = elements.copyText.childNodes[3];
        if (copyBtn.style.backgroundColor === 'rgb(87, 132, 245)') {
            const copiedText = elements.textArea.value;
            navigator.clipboard.writeText(copiedText);
            const input = elements.copyText.querySelector('input.text');
            input.select();

            copyBtn.style.backgroundColor = '#2bbe60';
            elements.copyText.classList.add('active');

            setTimeout(() => {
                elements.copyText.classList.remove('active');
            }, 2500);
        }
    }
};

//Event Handlers

elements.toggleBtn.addEventListener('click', handleDarkMode);
elements.submitButton.addEventListener('click', onSubmit);
elements.entityType.addEventListener('change', () => {
    const isOrganization = elements.entityType.value === 'organization';
    elements.username.placeholder = isOrganization
        ? 'Enter GitHub organization'
        : 'Enter your GitHub username';

    if (valueToCopy.username) {
        generateLink();
        setLoader();
        getGraph(valueToCopy.username, elements.entityType.value);
    }
});
elements.copyText.addEventListener('click', copyLink);
inputElements.bgInput.addEventListener('input', changeBgColor);
inputElements.lineInput.addEventListener('input', changeLineColor);
inputElements.ltgInput.addEventListener('input', changeLabelsAndGridColor);
inputElements.pointInput.addEventListener('input', changePointColor);
elements.themeSelect.addEventListener('change', onThemeChange);


// Apply the same custom select design to all picker controls.
(() => {
    document.querySelectorAll('select.picker').forEach((select) => {
        if (select.dataset.customized === 'true') return;

        const shell = document.createElement('div');
        shell.className = 'theme-select';
        select.parentNode.insertBefore(shell, select);
        shell.appendChild(select);
        select.dataset.customized = 'true';
        select.classList.add('theme-select__native');
        select.setAttribute('aria-hidden', 'true');
        select.tabIndex = -1;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'theme-select__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', select.getAttribute('aria-label') || select.labels?.[0]?.textContent || 'Choose an option');

        const value = document.createElement('span');
        value.className = 'theme-select__value';
        const chevron = document.createElement('span');
        chevron.className = 'theme-select__chevron';
        chevron.setAttribute('aria-hidden', 'true');
        trigger.append(value, chevron);

        const menu = document.createElement('div');
        menu.className = 'theme-select__menu';
        menu.setAttribute('role', 'listbox');
        menu.setAttribute('aria-label', select.getAttribute('aria-label') || 'Options');
        menu.hidden = true;

        const options = Array.from(select.options).map((option) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'theme-select__option';
            item.setAttribute('role', 'option');
            item.dataset.value = option.value;
            item.textContent = option.textContent;
            item.tabIndex = -1;
            item.addEventListener('click', () => {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closeMenu();
                trigger.focus();
            });
            menu.appendChild(item);
            return item;
        });

        const syncOptions = () => {
            const selected = select.options[select.selectedIndex];
            value.textContent = selected ? selected.textContent : 'Select an option';
            options.forEach((item) => {
                const active = item.dataset.value === select.value;
                item.setAttribute('aria-selected', String(active));
                item.classList.toggle('is-selected', active);
                item.querySelector('.theme-select__check')?.remove();
                if (active) {
                    const check = document.createElement('span');
                    check.className = 'theme-select__check';
                    check.setAttribute('aria-hidden', 'true');
                    check.textContent = '✓';
                    item.appendChild(check);
                }
            });
        };

        const openMenu = () => {
            menu.hidden = false;
            shell.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            const active = options.find((item) => item.dataset.value === select.value) || options[0];
            active?.focus();
            active?.scrollIntoView({ block: 'nearest' });
        };

        function closeMenu() {
            menu.hidden = true;
            shell.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
        trigger.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                openMenu();
            }
        });

        menu.addEventListener('keydown', (event) => {
            const current = options.indexOf(document.activeElement);
            if (event.key === 'Escape' || event.key === 'Tab') {
                closeMenu();
                trigger.focus();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                options[(current + delta + options.length) % options.length]?.focus();
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                options[event.key === 'Home' ? 0 : options.length - 1]?.focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                document.activeElement?.click();
            }
        });

        document.addEventListener('pointerdown', (event) => {
            if (!shell.contains(event.target)) closeMenu();
        });
        select.addEventListener('change', syncOptions);
        shell.append(trigger, menu);
        syncOptions();
    });
})();
