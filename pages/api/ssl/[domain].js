const tls = require('tls');
const dayjs = require('dayjs');

const ssl = (domain) => {
    return new Promise((resolve, reject) => {
        const urlParse = new URL(domain);

        // get detail domain
        const domainDetail = {};
        domainDetail.host = urlParse.hostname;
        domainDetail.port = urlParse.port || 443;

        if (urlParse.protocol.includes('http:')) {
            reject(new Error('Domain harus menggunakan https: protocol.!'))
        }

        const socket = tls.connect({
            host: domainDetail.host,
            port: domainDetail.port,
            servername: domainDetail.host,
        });

        socket.setTimeout(3000);

        socket.on('secureConnect', () => {
            const peerCertificate = socket.getPeerCertificate(true);
            domainDetail.validFrom = dayjs(peerCertificate.valid_from).format('DD/MM/YYYY');
            domainDetail.validTo = dayjs(peerCertificate.valid_to).format('DD/MM/YYYY');
            domainDetail.expired = dayjs(peerCertificate.valid_to).diff(dayjs(), 'days');
            domainDetail.issuer = peerCertificate.issuerCertificate.subject.O;
            socket.end();
            resolve(domainDetail);
        });

        socket.on('timeout', () => {
            socket.end();
        })

        socket.on('error', (err) => {
            socket.end();
            reject(new Error(`Failed to Fetch SSL Detail. ERR: ${err.message}`));
        });

        socket.on('end', () => {
            socket.destroy();
        })
    });
}

export default function handler(req, res) {
    res.status(200).json({ name: 'John Doe' })
}