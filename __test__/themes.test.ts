import { selectColors } from '../src/styles/themes';
import { themes } from './fakeInputs';

test('Theme testing', () => {
    expect.assertions(25);
    expect(selectColors('dracula')).toEqual(themes['dracula']);
    expect(selectColors('gruvbox')).toEqual(themes['gruvbox']);
    expect(selectColors('github')).toEqual(themes['github']);
    expect(selectColors('rogue')).toEqual(themes['rogue']);
    expect(selectColors('redical')).toEqual(themes['redical']);
    expect(selectColors('radical')).toEqual(themes['redical']);
    expect(selectColors('xcode')).toEqual(themes['xcode']);
    expect(selectColors('coral')).toEqual(themes['coral']);
    expect(selectColors('react-dark')).toEqual(themes['reactDark']);
    expect(selectColors('nord')).toEqual(themes['nord']);
    expect(selectColors('lucent')).toEqual(themes['lucent']);
    expect(selectColors('chartreuse-dark')).toEqual(themes['chartreuseDark']);
    expect(selectColors('github-light')).toEqual(themes['githubLight']);
    expect(selectColors('minimal')).toEqual(themes['minimal']);
    expect(selectColors('shadcn-white')).toEqual({
        areaColor: '18181B',
        bgColor: 'FFFFFF',
        borderColor: 'E4E4E7',
        color: '09090B',
        titleColor: '09090B',
        lineColor: '18181B',
        pointColor: '18181B',
    });
    expect(selectColors('shadcn-dark')).toEqual({
        areaColor: 'FAFAFA',
        bgColor: '09090B',
        borderColor: '27272A',
        color: 'FAFAFA',
        titleColor: 'FAFAFA',
        lineColor: 'FAFAFA',
        pointColor: 'FAFAFA',
    });
    expect(selectColors('material-palenight')).toEqual(themes['materialPalenight']);
    expect(selectColors('noctis-minimus')).toEqual(themes['noctis_minimus']);
    expect(selectColors('one-dark')).toEqual(themes['one_dark']);
    expect(selectColors('monokai')).toEqual(themes['monokai']);
    expect(selectColors('gotham')).toEqual(themes['gotham']);
    expect(selectColors('green')).toEqual(themes['green']);
    expect(selectColors('aqua')).toEqual(themes['aqua']);
    expect(selectColors('synthwave-84')).toEqual(themes['synthwave-84']);
    expect(selectColors('default')).toEqual(themes['default']);
});
