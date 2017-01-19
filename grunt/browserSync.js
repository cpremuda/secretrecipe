var url = require('url');



module.exports = {
        dev: {
            options: {
                ghostMode: {
                    clicks: true,
                    forms: true,
                    scroll: true
                },
                open: 'external',
                host: 'local.ba.intuit.com',
                proxy: "https://local.ba.intuit.com/",
                port: 3010

            }
        }
};
