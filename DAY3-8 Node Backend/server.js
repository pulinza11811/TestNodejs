const express = require('express'); // เรียกใช้งานโมดูล express
const app = express(); // สร้างแอปพลิเคชัน express
const bodyParser = require('body-parser'); // เรียกใช้งานโมดูล body-parser

const { PrismaClient } = require('@prisma/client');
const { error } = require('console');
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken'); //npm i jsonwebtoken
const dotenv = require('dotenv'); //npm i dotenv
dotenv.config();

const fs = require('fs');

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(bodyParser.json()); // ใช้ middleware สำหรับแปลงข้อมูล JSON ใน request body
app.use(bodyParser.urlencoded({ extended: true })); // ใช้ middleware สำหรับแปลงข้อมูล URL-encoded ใน request body

app.use('/uploads', express.static('uploads'));

const bookController = require('./controllers/BookController')
app.use('/book', bookController);

const cors = require('cors');
app.use(cors());

function checkSingIn(req, res, next) {
    try {
        const secret = process.env.TOKEN_SECRET;
        const token = req.headers['authorization'];
        const result = jwt.verify(token, secret);

        if (result != undefined) {
            next();
        }
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

app.get('/user/info', checkSingIn, (req, res, next) => {
    try {
        res.send('hello back office user info');
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/', (req, res) => { // กำหนดเส้นทาง GET ที่ root path '/'
    res.send('hello world by express by kob'); // ส่งข้อความ 'hello world by express by kob' กลับไปยังผู้ใช้
});

app.get('/hello/:name', (req, res) => { // กำหนดเส้นทาง GET ที่ path '/hello/:name'
    res.send('hello ' + req.params.name); // ส่งข้อความ 'hello ' ตามด้วยค่าของพารามิเตอร์ name กลับไปยังผู้ใช้
});

app.get('/hi/:name/:age', (req, res) => { // กำหนดเส้นทาง GET ที่ path '/hi/:name/:age'
    const name = req.params.name; // ดึงค่าพารามิเตอร์ name จาก URL
    const age = req.params.age; // ดึงค่าพารามิเตอร์ age จาก URL
    //res.send('name = ' + name + ' age = ' + age); // ส่งข้อความที่มีค่าพารามิเตอร์ name และ age กลับไปยังผู้ใช้ (ถูกคอมเมนต์ออก)
    res.send(`name ${name} age ${age}`); // ส่งข้อความที่มีค่าพารามิเตอร์ name และ age ในรูปแบบ Template Literal กลับไปยังผู้ใช้
});

app.post('/hello', (req, res) => { // กำหนดเส้นทาง POST ที่ path '/hello'
    res.send(req.body); // ส่งข้อมูลที่รับมาจาก request body กลับไปยังผู้ใช้
});

app.put('/hello', (req, res) => { // กำหนดเส้นทาง PUT ที่ path '/hello'
    res.send(req.body); // ส่งข้อมูลที่รับมาจาก request body กลับไปยังผู้ใช้
});


app.put('/updateCustomer/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;

    res.send({ id: id, data: data });
})

app.delete('/myDelete/:id', (req, res) => {
    res.send('id = ' + req.params.id);
})

app.get('/book/list', async (req, res) => {
    const data = await prisma.book.findMany();
    res.send({ data: data });
})

app.post('/book/create', async (req, res) => {
    const data = req.body;
    const result = await prisma.book.create({
        data: data
    }) //INSERT Book(isbn, name , price) VALUES(:isbn, :name , :price)

    res.send({ result: result })
})

app.post('/book/createManual', async (req, res) => {
    const result = await prisma.book.create({
        data: {
            isbn: '1004',
            name: 'Flutter',
            price: 850
        }
    })

    res.send({ result: result })
})

app.put('/book/update/:id', async (req, res) => {
    try {
        await prisma.book.update({
            data: {
                isbn: '1004',
                name: 'Flutter',
                price: 1600
            },
            where: {
                id: parseInt(req.params.id)
            }
        })

        res.send({ message: 'succeess' })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.delete('/book/remove/:id', async (req, res) => {
    try {
        await prisma.book.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })

        res.send({ message: 'success' })

    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.post('/book/search', async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where: {
                name: {
                    contains: keyword // LIKE('%keyword%')
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.post('/book/startsWith', async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where: {
                name: {
                    startsWith: keyword
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.post('/book/endsWith', async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where: {
                name: {
                    endsWith: keyword
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/orderBy', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            orderBy: {
                price: 'desc'
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/gt', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                price: {
                    gt: 1000 //มีค่ามากกว่า > 1000 จะแสดงออกมา
                }
            }
        })
        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/lt', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                price: {
                    lt: 1000 //มีค่าน้อยกว่า > 1000 จะแสดงออกมา
                }
            }
        })
        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/notNull', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                detail: {
                    not: null
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/isNull', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                detail: null
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/book/between', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                price: {
                    lte: 1500, // <= 1500
                    gte: 900 // >= 900
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/sum', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _sum: {
                price: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/max', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _max: {
                name: true,
                price: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/min', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _min: {
                price: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/avg', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _avg: {
                price: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/findYearMonthDay', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registerDate: new Date('2024-05-08')
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/findYearMonth', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registerDate: {
                    gte: new Date('2024-05-01'),
                    lte: new Date('2024-05-31')
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/book/findYear', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registerDate: {
                    gte: new Date('2024-01-01'),
                    lte: new Date('2024-12-31')
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/user/createToken', (req, res) => {
    try {
        const secret = process.env.TOKEN_SECRET;
        const payload = {
            id: 100,
            name: 'Owen',
            level: 'admin'
        }
        const token = jwt.sign(payload, secret, { expiresIn: '1d' })

        res.send({ token: token })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/user/verifyToken', (req, res) => {
    try {
        const secret = process.env.TOKEN_SECRET;
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJuYW1lIjoiT3dlbiIsImxldmVsIjoiYWRtaW4iLCJpYXQiOjE3MTcwMTEwMTYsImV4cCI6MTcxNzA5NzQxNn0.dJhReNPFfIx4mhJ9Y-QcTzuB4KsW5gpKoZBNiFGpmeg';
        const result = jwt.verify(token, secret);

        res.send({ result: result })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/oneToOne', async (req, res) => {
    try {
        const data = await prisma.orderDetail.findMany({
            include: {
                book: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/oneToMany', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            include: {
                OrderDetail: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/multiModel', async (req, res) => {
    try {
        const data = await prisma.customer.findMany({
            include: {
                Order: {
                    include: {
                        OrderDetail: true
                    }
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.post('/book/testUpload', (req, res) => {
    try {
        const myFile = req.files.myFile;

        myFile.mv('./uploads/' + myFile.name, (err) => {
            if (err) {
                res.status(500).send({ error: err })
            }
            res.send({ message: 'success' })
        })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/readFile', (req, res) => {
    try {
        fs.readFile('test.txt', (err, data) => {
            if (err) {
                throw err;
            }

            res.send(data);
        })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/writeFile', (req, res) => {
    try {
        const fs = require('fs');
        fs.writeFile('test.txt', 'hello by owen', (err) => {
            if (err) {
                throw err;
            }
        })

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/removeFile', (req, res) => {
    try {
        const fs = require('fs');
        fs.unlinkSync('test.txt');
        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/fileExists', (req, res) => {
    try {
        const fs = require('fs');
        const found = fs.existsSync('package.json');

        res.send({ found: found })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/createPdf', (req, res) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream('output.pdf'));
    doc
        .font('Sarabun/Sarabun-Medium.ttf')
        .fontSize(25)
        .text('สวัสดี ทดสอบภาษาไทย', 100, 100);
    doc
        .addPage() //เพิ่มเพจที่ 2
        .fontSize(25)
        .text('Here is some vector graphics...', 100, 100);

    doc.end();

    res.send({ message: 'success' })
})

app.get('/readExcel', async (req, res) => {
    try {
        const excel = require('exceljs');
        const wb = new excel.Workbook();
        await wb.xlsx.readFile('productExport.xlsx');
        const ws = wb.getWorksheet(1);

        for (let i = 1; i < ws.rowCount; i++) {
            const row = ws.getRow(i);
            const barcode = row.getCell(1).value;
            const name = row.getCell(2).value;
            const cost = row.getCell(3).value;
            const sale = row.getCell(4).value;
            const send = row.getCell(5).value;
            const unit = row.getCell(6).value;
            const point = row.getCell(7).value;
            const productTypeId = row.getCell(8).value;

            console.log(barcode, name, cost, sale, send, unit, point, productTypeId);
        }

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.listen(3000, (req, res) => { // เริ่มต้นเซิร์ฟเวอร์และให้แอปพลิเคชันรับฟังการเชื่อมต่อที่พอร์ต 3000
    console.log('Listening on port 127.0.0.1:3000'); // แสดงข้อความใน console ว่าเซิร์ฟเวอร์กำลังรับฟังที่ 127.0.0.1:3000
});
