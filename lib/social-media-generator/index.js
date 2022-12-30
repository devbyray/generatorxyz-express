import dotenv from 'dotenv'
dotenv.config()
import 'isomorphic-fetch'

async function getCompletion(input) {
	const request = await fetch('https://api.openai.com/v1/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			'OpenAI-Organization': 'org-qLG0OeNVKWx44kfXfn8N1QQY',
		},
		body: JSON.stringify(input),
	})
	return request
}

const ReqContentType = {
	'facebook' : 'Facebook Post',
	'instagram' : 'Instagram Post',
	'linkedin' : 'LinkedIn Post',
	'twitter' : 'Twitter Post',
}

export default async (pageContent, type, amount) => {
	return new Promise(async (resolve, reject) => {
		const typeAmount = amount ? parseInt(amount, 0) : 1

		if (!pageContent || !type || !typeAmount) return new Error('Missing parameters')

		try {
			if (!pageContent || !type)
				return {
					statusCode: 400,
					body: JSON.stringify({
						error: 'Missing parameters',
					}),
				}

			const contentType = ReqContentType[type]

			const contentTypes = `${contentType}${typeAmount > 1 ? 's' : ''}`
			const prompt = `Generate ${typeAmount} ${contentTypes} from this content to promote it: ${pageContent}`

			console.log('prompt: ', prompt)

			const request = await getCompletion({
				model: 'text-davinci-003',
				prompt: prompt,
				temperature: 0.5,
				max_tokens: 500,
			})

			const data = await request.json()
			const basePrice = 0.02 / 1000
			const costs = data?.usage?.total_tokens * basePrice
			const responseText = data?.choices.map((choice) => choice.text).join('')
			// console.log({data, summaryData, request})
			resolve({
				statusCode: 200,
				body: {
					data,
					responseText,
					basePrice,
					costs,
					bodyContent: pageContent,
				},
			})
		} catch (error) {
			reject({
				statusCode: 500,
				body: {
					error: 'Something went wrong',
				},
			})
		}
	})
}
