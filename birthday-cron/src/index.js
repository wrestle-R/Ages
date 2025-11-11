/**
 * Cloudflare Workers Cron Job for Birthday Email System
 * 
 * This worker runs every 5 minutes to check for birthdays and send emails.
 * It calls the Flask backend hosted on Render.
 * 
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to test locally
 * - Run `npm run deploy` to publish your worker
 * 
 * Configure API_KEY secret in Cloudflare dashboard:
 * wrangler secret put API_KEY
 */

const BACKEND_URL = 'https://ages-5g4e.onrender.com';
const BIRTHDAY_ENDPOINT = '/api/send-birthday-emails';

export default {
	// Handle HTTP requests (for manual testing)
	async fetch(req, env, ctx) {
		const url = new URL(req.url);
		
		// Manual trigger endpoint
		if (url.pathname === '/trigger') {
			try {
				const result = await triggerBirthdayCheck(env);
				return new Response(JSON.stringify(result, null, 2), {
					headers: { 'Content-Type': 'application/json' },
					status: result.success ? 200 : 500
				});
			} catch (error) {
				return new Response(JSON.stringify({
					success: false,
					error: error.message,
					timestamp: new Date().toISOString()
				}, null, 2), {
					headers: { 'Content-Type': 'application/json' },
					status: 500
				});
			}
		}
		
		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({
				status: 'healthy',
				service: 'birthday-cron',
				backend: BACKEND_URL,
				timestamp: new Date().toISOString()
			}, null, 2), {
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		// Default response with testing instructions
		return new Response(`
Birthday Email Cron Job Worker

Endpoints:
- GET /health - Health check
- GET /trigger - Manually trigger birthday check

Scheduled to run: Every 5 minutes
Backend: ${BACKEND_URL}

To test scheduled handler:
curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"
		`.trim(), {
			headers: { 'Content-Type': 'text/plain' }
		});
	},

	// Scheduled handler - runs every 5 minutes
	async scheduled(event, env, ctx) {
		console.log(`🎂 Birthday cron triggered at ${event.cron} (${new Date().toISOString()})`);
		
		try {
			const result = await triggerBirthdayCheck(env);
			
			if (result.success) {
				console.log(`✅ Success: ${result.message}`);
				if (result.emails_sent && result.emails_sent.length > 0) {
					console.log(`📧 Emails sent:`, JSON.stringify(result.emails_sent, null, 2));
				}
			} else {
				console.error(`❌ Error: ${result.error || result.message}`);
			}
		} catch (error) {
			console.error(`❌ Fatal error in scheduled task:`, error);
		}
	},
};

/**
 * Trigger the birthday check endpoint on the Flask backend
 */
async function triggerBirthdayCheck(env) {
	const url = `${BACKEND_URL}${BIRTHDAY_ENDPOINT}`;
	
	try {
		// Prepare headers with API key if available
		const headers = {
			'Content-Type': 'application/json',
			'User-Agent': 'Cloudflare-Workers-Cron/1.0'
		};
		
		// Add API key from environment if set
		if (env.API_KEY) {
			headers['X-API-Key'] = env.API_KEY;
		}
		
		console.log(`📡 Calling: ${url}`);
		
		const response = await fetch(url, {
			method: 'POST',
			headers: headers
		});
		
		const data = await response.json();
		
		if (!response.ok) {
			return {
				success: false,
				error: data.message || data.error || 'Unknown error',
				status: response.status,
				timestamp: new Date().toISOString()
			};
		}
		
		return {
			success: true,
			message: data.message || 'Birthday check completed',
			emails_sent: data.emails_sent || [],
			backend_timestamp: data.timestamp,
			timestamp: new Date().toISOString()
		};
		
	} catch (error) {
		console.error(`Error calling backend:`, error);
		return {
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		};
	}
}
