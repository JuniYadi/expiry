const whois = require('whois');
const parser = require('parse-whois');
const dayjs = require('dayjs');

const domain = (domain) => {
    return new Promise((resolve, reject) => {
        let server = {};

        if (domain.includes(".xyz")) {
            server["server"] = "whois.nic.xyz:43";
        }

        whois.lookup(domain, server, function (err, data) {
            if (err) { reject(err) };

            const parseData = parser.parseWhoIsData(data);

            let domain;
            let createdAt;
            let updatedAt;
            let expiredAt;
            let registrarName;
            let registrarURL;
            const nameServer = [];


            parseData.map(val => {
                switch (val.attribute) {
                    case 'Domain Name':
                        domain = val.value;
                        break;

                    case 'Created Date':
                    case 'Created On':
                    case 'Creation Date':
                        createdAt = dayjs(val.value).format('DD/MM/YYYY');
                        break;

                    case 'Updated Date':
                    case 'Last Updated On':
                        updatedAt = dayjs(val.value).format('DD/MM/YYYY');
                        break;

                    case 'Registrar Registration Expiration Date':
                    case 'Expiration Date':
                        expiredAt = dayjs(val.value);
                        break;

                    case 'Sponsoring Registrar Organization':
                    case 'Registrar':
                        registrarName = val.value;
                        break;

                    case 'Sponsoring Registrar URL':
                    case 'Registrar URL':
                        registrarURL = val.value;
                        break;

                    case 'Name Server':
                        nameServer.push(val.value);
                        break;

                    default:
                        break;
                }
            })

            // conver to human
            const expiredAtHuman = dayjs(expiredAt).diff(dayjs(), 'days');
            expiredAt = dayjs(expiredAt).format('DD/MM/YYYY');

            const dataResponse = { domain, createdAt, updatedAt, expiredAt, expiredAtHuman, registrarName, registrarURL, nameServer }

            console.log(dataResponse)

            resolve(dataResponse);
        })
    })
}

export default function handler(req, res) {
    const { domain } = req.query

    res.status(200).json({ name: 'John Doe', domain })
}