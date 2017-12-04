export enum PAGE_STATUS {
    UNLOAD = 0,
    WILL_ENTER,
    DID_ENTER,
    WILL_LEAVE,
    DID_LEAVE
}

export const bankList = [
    { code: 'BOS', name: '上海银行' },
    { code: 'CITIC', name: '中信银行' },
    { code: 'PSBC', name: '中国邮储银行' },
    { code: 'BOC', name: '中国银行' },
    { code: 'COMM', name: '交通银行' },
    { code: 'CEB', name: '光大银行' },
    { code: 'CIB', name: '兴业银行' },
    { code: 'ABC', name: '农业银行' },
    { code: 'HXB', name: '华夏银行' },
    { code: 'ICBC', name: '工商银行' },
    { code: 'SZPAB', name: '平安银行' },
    { code: 'GDB', name: '广发银行' },
    { code: 'CCB', name: '建设银行' },
    { code: 'CMB', name: '招商银行' },
    { code: 'CMBC', name: '民生银行' },
    { code: 'SPDB', name: '浦发银行' }
];
export const bankCodeNameMap = {};
bankList.forEach(bank => {
    bankCodeNameMap[bank.code] = bank.name;
});

export const bankResourcesList = {
    上海银行: { color: '#6b7ac4' },
    中信银行: { color: '#ef6355' },
    中国邮储银行: { color: '#35c26d' },
    中国银行: { color: '#ef6355' },
    交通银行: { color: '#489dd5' },
    光大银行: { color: '#ad59c6' },
    兴业银行: { color: '#489dd5' },
    农业银行: { color: '#35c26d' },
    华夏银行: { color: '#ef6355' },
    工商银行: { color: '#ef6355' },
    平安银行: { color: '#fe8b0b' },
    广发银行: { color: '#489dd5' },
    建设银行: { color: '#489dd5' },
    招商银行: { color: '#f0515e' },
    民生银行: { color: '#489dd5' },
    浦发银行: { color: '#489dd5' }
};

export const bankMixList = bankList.map(bankcard => {
    return Object.assign(bankcard, {
        color: bankResourcesList[bankcard.name],
        icon_url: `assets/images/bank/${bankcard.name}/logo.png`,
        mask_url: `assets/images/bank/${bankcard.name}/logo-mask.png`,
    });
});

export const bankAssetsBaseUrl = 'assets/images/bank/';
