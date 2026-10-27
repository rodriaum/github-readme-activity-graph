const elements = {
    toggleBtn: document.querySelector('.toggle-btn'),
    bgColor: document.querySelector('.bg-color'),
    loader: document.querySelector('.loader'),
    preview: document.querySelector('.rect'),
    placeholder: document.querySelector('.chart_placeholder'),
    copyContainer: document.querySelector('.copy_container'),
    textArea: document.querySelector('.text'),
    copyText: document.querySelector('.copy_text'),
    submitButton: document.getElementById('submit-button'),
    username: document.getElementById('username'),
    entityType: document.getElementById('entityType'),
    themeSelect: document.getElementById('themeSelect'),
    includePrivate: document.getElementById('includePrivate'),
    authButton: document.getElementById('auth-button'),
};
// Theme definitions
const themes = {
    default: { bgColor: '#ffcfe9', line: '#9e4c98', point: '#403d3d', color: '#9e4c98' },
    github: { bgColor: '#293036', line: '#9ecbff', point: '#f97583', color: '#ffffff' },
    'github-light': { bgColor: '#ffffff', line: '#9be9a8', point: '#40c463', color: '#000000' },
    'github-compact': { bgColor: '#00000000', line: '#26a641', point: '#8b949e', color: '#8b949e' },
    'github-dark': { bgColor: '#0D1117', line: '#1F6FEB', point: '#58A6FF', color: '#58A6FF' },
    'github-dark-dimmed': { bgColor: '#24292F', line: '#ADBAC7', point: '#539bf5', color: '#ADBAC7' },
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
    'material-palenight': { bgColor: '#292d3e', line: '#c792ea', point: '#89ddff', color: '#a6accd' },
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
    inputElements.bgInput.value = theme.bgColor;
    inputElements.lineInput.value = theme.line;
    inputElements.pointInput.value = theme.point;
    inputElements.ltgInput.value = theme.color;
    valueToCopy.bgColor = theme.bgColor;
    valueToCopy.line = theme.line;
    valueToCopy.point = theme.point;
    valueToCopy.color = theme.color;
    applyGraphColors();
    syncSkeletonTheme();
    generateLink();
};

const inputElements = {
    bgInput: document.getElementById('bgColor'),
    lineInput: document.getElementById('line'),
    ltgInput: document.getElementById('color'),
    pointInput: document.getElementById('point'),
};

/*-----------------------------------------
                Toast notifications
-------------------------------------------*/

const showToast = (message, type = 'error') => {
    let container = document.querySelector('.toast-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = type === 'error' ? '!' : type === 'success' ? '✓' : 'i';

    const text = document.createElement('p');
    text.className = 'toast__message';
    text.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'toast__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '×';

    let timeoutId;
    const dismiss = () => {
        clearTimeout(timeoutId);
        toast.classList.add('toast--leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 250);
    };

    closeButton.addEventListener('click', dismiss);
    toast.append(icon, text, closeButton);
    container.appendChild(toast);

    timeoutId = setTimeout(dismiss, 5000);
};

/*-----------------------------------------
                Fetch user's contribution data
        and generate graph link
-------------------------------------------*/

const valueToCopy = {
    username: '',
    bgColor: '#ffcfe9',
    color: '#9e4c98',
    line: '#9e4c98',
    point: '#403d3d',
    includePrivate: false,
};

const setGraphLoading = (loading) => {
    elements.preview.classList.toggle('is-loading', loading);
    elements.preview.setAttribute('aria-busy', String(loading));
    elements.submitButton.disabled = loading;
    elements.submitButton.setAttribute('aria-busy', String(loading));
};
const removeLoader = () => {
    elements.loader.classList.remove('active');
    setGraphLoading(false);
};

const removePlaceholder = () => {
    elements.placeholder.classList.remove('active');
    elements.copyContainer.style.marginTop = '2rem';
};

const syncSkeletonTheme = () => {
    const preview = elements.preview;
    preview.style.setProperty('--skeleton-background', valueToCopy.bgColor);
    preview.style.setProperty('--skeleton-line', valueToCopy.line);
    preview.style.setProperty('--skeleton-point', valueToCopy.point);
    preview.style.setProperty('--skeleton-text', valueToCopy.color);
};

// Keep theme colors on the preview independently of the current SVG instance.
// Chartist creates a new SVG when data changes or the chart is resized, so
// styles applied only to individual SVG nodes are lost. Reapply them to every
// generated node and use !important to override the default stylesheet.
const applyGraphColors = () => {
    elements.preview.style.backgroundColor = valueToCopy.bgColor;

    document.querySelectorAll('.ct-line').forEach((el) => {
        el.style.setProperty('stroke', valueToCopy.line, 'important');
    });
    document.querySelectorAll('.ct-point').forEach((el) => {
        el.style.setProperty('stroke', valueToCopy.point, 'important');
    });
    document.querySelectorAll('.ct-label').forEach((el) => {
        el.style.setProperty('fill', valueToCopy.color, 'important');
        el.style.setProperty('color', valueToCopy.color, 'important');
    });
    document.querySelectorAll('.ct-axis-title').forEach((el) => {
        el.style.setProperty('fill', valueToCopy.color, 'important');
    });
    document.querySelectorAll('.ct-grid').forEach((el) => {
        el.style.setProperty('stroke', valueToCopy.color, 'important');
    });
    document.querySelectorAll('.ct-series-a .ct-area').forEach((el) => {
        el.style.setProperty('fill', valueToCopy.color, 'important');
    });
};

const generateLink = () => {
    const isOrganization = elements.entityType.value === 'organization';
    const parameter = isOrganization ? 'organization' : 'username';
    const label = isOrganization
        ? `${valueToCopy.username} organization activity graph`
        : `${valueToCopy.username}'s GitHub activity graph`;
    const profileUrl = `https://github.com/${valueToCopy.username}`;
    const graphUrl =
        `https://github-act-graph.rodriaum.com/graph?${parameter}=${encodeURIComponent(valueToCopy.username)}` +
        `&bg_color=${valueToCopy.bgColor.slice(1)}&color=${valueToCopy.color.slice(1)}` +
        `&line=${valueToCopy.line.slice(1)}&point=${valueToCopy.point.slice(1)}` +
        `&area=true&hide_border=true&include_private=${valueToCopy.includePrivate ? 'true' : 'false'}`;
    const link = `[![${label}](${graphUrl})](${profileUrl})`;
    elements.textArea.value = link;
    elements.copyText.childNodes[3].style.backgroundColor = 'rgb(87, 132, 245)';
    return link;
};

const getGraph = (username, type) => {
    setGraphLoading(true);
    elements.placeholder.classList.remove('active');

    const options = {
        height: 380,
        axisY: {
            title: 'Contributions',
            onlyInteger: true,
            offset: 70,
            labelOffset: { y: 4.5 },
        },
        axisX: {
            title: 'Days',
            offset: 50,
            labelOffset: { x: -4.5 },
        },
        chartPadding: { top: 80, right: 50, bottom: 20, left: 20 },
        showArea: true,
        fullWidth: true,
        plugins: [
            Chartist.plugins.ctAxisTitle({
                axisX: {
                    axisTitle: 'Days',
                    axisClass: 'ct-axis-title',
                    offset: { x: 0, y: 50 },
                    textAnchor: 'middle',
                },
                axisY: {
                    axisTitle: 'Contributions',
                    axisClass: 'ct-axis-title',
                    offset: { x: 0, y: 50 },
                    textAnchor: 'middle',
                    flipTitle: true,
                },
            }),
        ],
    };

    const parameter = type === 'organization' ? 'organization' : 'username';
    const query =
        `${parameter}=${encodeURIComponent(username)}` +
        `&include_private=${valueToCopy.includePrivate ? 'true' : 'false'}`;

    axios({ url: `/data?${query}`, method: 'GET' })
        .then((contributionData) => {
            const days = contributionData.data?.contributions;
            if (!Array.isArray(days)) {
                throw new Error(
                    contributionData.data?.error || 'The server did not return valid contribution data.',
                );
            }

            const data = {
                labels: days.map((day) => day.date),
                series: [{ value: days.map((day) => day.contributionCount) }],
            };

            document.querySelector('.ct-chart').innerHTML = '';
            const chartContainer = document.querySelector('.ct-chart');
            // Keep a single observer for this container. Chartist replaces SVG
            // children on redraw/resize, so styling only the current nodes is
            // not enough to preserve the selected colors.
            chartContainer.__colorObserver?.disconnect();
            new Chartist.Line('.ct-chart', data, options);
            const observer = new MutationObserver(() => applyGraphColors());
            observer.observe(chartContainer, { childList: true, subtree: true });
            chartContainer.__colorObserver = observer;

            applyGraphColors();
            requestAnimationFrame(applyGraphColors);
            removeLoader();
            removePlaceholder();
            generateLink();
        })
        .catch((err) => {
            console.error('Failed to load activity graph:', err);
            removeLoader();
            if (!document.querySelector('.ct-chart svg')) {
                elements.placeholder.classList.add('active');
            }
            showToast(err.response?.data?.error || err.message || 'Sorry, something went wrong.');
        });
};

const onSubmit = (event) => {
    event.preventDefault();
    const username = elements.username.value;
    if (username.length > 0) {
        valueToCopy.username = username.trim();
        getGraph(valueToCopy.username, elements.entityType.value);
    } else {
        showToast('Enter a GitHub username or organization name.');
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
if (darkMode === 'enabled') enableDarkMode();

const handleDarkMode = () => {
    darkMode = localStorage.getItem('darkMode');
    if (darkMode !== 'enabled') enableDarkMode();
    else disableDarkMode();
};

// Dynamic changes
const changeBgColor = () => {
    valueToCopy.bgColor = inputElements.bgInput.value;
    syncSkeletonTheme();
    applyGraphColors();
    generateLink();
};

const changeLineColor = () => {
    valueToCopy.line = inputElements.lineInput.value;
    syncSkeletonTheme();
    applyGraphColors();
    generateLink();
};

const changeLabelsAndGridColor = () => {
    valueToCopy.color = inputElements.ltgInput.value;
    syncSkeletonTheme();
    applyGraphColors();
    generateLink();
};

const changePointColor = () => {
    valueToCopy.point = inputElements.pointInput.value;
    syncSkeletonTheme();
    applyGraphColors();
    generateLink();
};

const copyLink = () => {
    if (elements.textArea.value !== '') {
        const copyBtn = elements.copyText.childNodes[3];
        if (copyBtn.style.backgroundColor === 'rgb(87, 132, 245)') {
            navigator.clipboard.writeText(elements.textArea.value);
            elements.copyText.querySelector('input.text').select();
            copyBtn.style.backgroundColor = '#2bbe60';
            elements.copyText.classList.add('active');
            setTimeout(() => elements.copyText.classList.remove('active'), 2500);
        }
    }
};

const refreshAuthStatus = async () => {
    try {
        const response = await axios.get('/auth/status', {
            withCredentials: true,
            headers: { 'Cache-Control': 'no-store' },
        });
        const auth = response.data;
        const isAuthenticated = auth.authenticated === true;
        elements.authButton.dataset.csrfToken = auth.csrfToken || '';
        elements.authButton.href = isAuthenticated ? '#logout' : '/auth/github';
        elements.authButton.querySelector('span').textContent = isAuthenticated
            ? `Logout (${auth.login})`
            : 'Login with GitHub';
        elements.includePrivate.disabled = !isAuthenticated;
        if (!isAuthenticated) {
            elements.includePrivate.checked = false;
            valueToCopy.includePrivate = false;
        }
        elements.includePrivate.title = isAuthenticated
            ? ''
            : 'Sign in with GitHub to include private activity.';
    } catch (error) {
        console.error('Could not check GitHub login status:', error);
        elements.authButton.href = '/auth/github';
        elements.authButton.querySelector('span').textContent = 'Login status unavailable';
        elements.authButton.title =
            'Could not verify your GitHub session. Check the deployment configuration and server logs.';
        elements.includePrivate.disabled = true;
        elements.includePrivate.checked = false;
        valueToCopy.includePrivate = false;
    }
};
elements.authButton.addEventListener('click', async (event) => {
    if (elements.authButton.href.endsWith('#logout')) {
        event.preventDefault();
        try {
            await axios.post(
                '/auth/logout',
                {},
                { headers: { 'X-CSRF-Token': elements.authButton.dataset.csrfToken || '' } },
            );
            valueToCopy.includePrivate = false;
            elements.includePrivate.checked = false;
            await refreshAuthStatus();
            if (valueToCopy.username) getGraph(valueToCopy.username, elements.entityType.value);
        } catch {
            showToast('Could not log out safely. Please retry.');
        }
    }
});
elements.includePrivate.addEventListener('change', () => {
    if (elements.includePrivate.disabled) return;
    valueToCopy.includePrivate = elements.includePrivate.checked;
    generateLink();
    if (valueToCopy.username) getGraph(valueToCopy.username, elements.entityType.value);
});
syncSkeletonTheme();
refreshAuthStatus();
elements.toggleBtn.addEventListener('click', handleDarkMode);
elements.submitButton.addEventListener('click', onSubmit);
elements.entityType.addEventListener('change', () => {
    const isOrganization = elements.entityType.value === 'organization';
    elements.username.placeholder = isOrganization
        ? 'Enter GitHub organization'
        : 'Enter your GitHub username';
    elements.username.value = '';
    valueToCopy.username = '';
    elements.textArea.value = '';
    document.querySelector('.ct-chart').innerHTML = '';
    elements.placeholder.classList.add('active');
    elements.copyContainer.style.marginTop = '';
    removeLoader();
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
        trigger.setAttribute(
            'aria-label',
            select.getAttribute('aria-label') || select.labels?.[0]?.textContent || 'Choose an option',
        );

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

        trigger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
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
