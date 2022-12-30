import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { pageContent, socialMediaGenerator } from './lib/index.js'

const app = express()
const port = process.env.PORT || 3001
app.use(express.json())
app.use(cors())
const allowlist = [
	'http://localhost:3000',
	'http://generatorxyz.com',
	'https://generatorxyz.com',
	'https://www.generatorxyz.com',
	'https://generatorxyz.com',
	'https://www.generatorxyz.com',
	'https://generatorxyz.netlify.app'
]
const corsOptionsDelegate = function (req, callback) {
	let corsOptions
	if (allowlist.indexOf(req.header('Origin')) !== -1 || req.header('Origin')?.endsWith('netlify.app')) {
		corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
	} else {
		corsOptions = { origin: false } // disable CORS for this request
	}
	callback(null, corsOptions) // callback expects two parameters: error and options
}
app.options('*', cors(corsOptionsDelegate))
app.get('/', (req, res) => {
	res.send({
		message: 'Hello, World!'
	})
})

app.post('/social-generator', cors(), async (req, res) => {
	const { content, type, amount } = req.body
	console.log(req)

	try {
		const { statusCode, body } = await socialMediaGenerator(content, type, amount)

		res.status(statusCode).send({
			body
		})
	} catch (error) {
		res.status(500).send({
			error
		})
	}
})

app.get('/page-content', cors(corsOptionsDelegate), async (req, res) => {
	const url = req.query?.url
	if (!url && url?.length > 0) {
		res.status(400).send({ error: 'No URL provided' })
	}
	console.log({ url })

	try {
		const { statusCode, body } = await pageContent(url)

		res.status(statusCode).send({
			body
		})
	} catch (error) {
		res.status(500).send({
			error
		})
	}
})

app.listen(port, () => {
	console.log(`Application listening on port ${port}`)
})
