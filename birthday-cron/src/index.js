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
		const cronStartTime = new Date();
		console.log('\n' + '='.repeat(80));
		console.log(`🎂 BIRTHDAY CRON JOB STARTED`);
		console.log(`⏰ Cron pattern: ${event.cron}`);
		console.log(`🕐 Start time: ${cronStartTime.toISOString()}`);
		console.log(`📍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
		console.log('='.repeat(80));
		
		try {
			const result = await triggerBirthdayCheck(env, cronStartTime);
			
			// Calculate duration
			const cronEndTime = new Date();
			const durationMs = cronEndTime - cronStartTime;
			const durationSeconds = (durationMs / 1000).toFixed(2);
			
			console.log('\n' + '-'.repeat(80));
			console.log(`📊 CRON JOB RESULTS`);
			console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
			console.log(`Message: ${result.message}`);
			console.log(`Duration: ${durationSeconds} seconds (${durationMs}ms)`);
			
			if (result.success) {
				if (result.emails_sent && result.emails_sent.length > 0) {
					console.log(`\n📧 EMAILS SENT: ${result.emails_sent.length}`);
					result.emails_sent.forEach((email, index) => {
						console.log(`  ${index + 1}. ${email.name} (${email.type}) at ${email.time}`);
					});
				} else {
					console.log(`\n📭 No birthday emails sent this run`);
				}
				
				// Show timing info from backend
				if (result.last_run_time && result.current_run_time) {
					console.log(`\n⏱️  TIMING INFORMATION:`);
					console.log(`   Last run: ${result.last_run_time}`);
					console.log(`   Current run: ${result.current_run_time}`);
					console.log(`   Time between runs: ${result.time_between_runs || 'N/A'}`);
				}
			} else {
				console.error(`❌ Error details: ${result.error || 'Unknown error'}`);
				if (result.status) {
					console.error(`HTTP Status: ${result.status}`);
				}
			}
			
			console.log('-'.repeat(80));
			console.log(`🏁 CRON JOB COMPLETED at ${cronEndTime.toISOString()}`);
			console.log('='.repeat(80) + '\n');
			
		} catch (error) {
			const cronEndTime = new Date();
			const durationMs = cronEndTime - cronStartTime;
			const durationSeconds = (durationMs / 1000).toFixed(2);
			
			console.error('\n' + '!'.repeat(80));
			console.error(`❌ FATAL ERROR IN CRON JOB`);
			console.error(`Error: ${error.message}`);
			console.error(`Stack: ${error.stack}`);
			console.error(`Duration before failure: ${durationSeconds} seconds`);
			console.error(`Time: ${cronEndTime.toISOString()}`);
			console.error('!'.repeat(80) + '\n');
		}
	},
};

/**
 * Trigger the birthday check endpoint on the Flask backend
 */
async function triggerBirthdayCheck(env, cronStartTime) {
	const url = `${BACKEND_URL}${BIRTHDAY_ENDPOINT}`;
	const requestStartTime = new Date();
	
	try {
		// Prepare headers with API key if available
		const headers = {
			'Content-Type': 'application/json',
			'User-Agent': 'Cloudflare-Workers-Cron/1.0'
		};
		
		// Add API key from environment if set
		if (env.API_KEY) {
			headers['X-API-Key'] = env.API_KEY;
			console.log(`🔐 API Key: Present`);
		} else {
			console.log(`⚠️  API Key: Not configured`);
		}
		
		console.log(`\n📡 BACKEND REQUEST`);
		console.log(`   URL: ${url}`);
		console.log(`   Method: POST`);
		console.log(`   Request time: ${requestStartTime.toISOString()}`);
		
		const response = await fetch(url, {
			method: 'POST',
			headers: headers
		});
		
		const responseTime = new Date();
		const requestDuration = responseTime - requestStartTime;
		
		console.log(`\n📥 BACKEND RESPONSE`);
		console.log(`   Status: ${response.status} ${response.statusText}`);
		console.log(`   Response time: ${responseTime.toISOString()}`);
		console.log(`   Request duration: ${requestDuration}ms`);
		
		const data = await response.json();
		
		if (!response.ok) {
			console.error(`❌ Backend returned error status ${response.status}`);
			console.error(`   Error: ${data.message || data.error || 'Unknown error'}`);
			return {
				success: false,
				error: data.message || data.error || 'Unknown error',
				status: response.status,
				timestamp: new Date().toISOString()
			};
		}
		
		console.log(`✅ Backend processed successfully`);
		if (data.emails_sent && data.emails_sent.length > 0) {
			console.log(`   📨 Backend sent ${data.emails_sent.length} email(s)`);
		}
		
		return {
			success: true,
			message: data.message || 'Birthday check completed',
			emails_sent: data.emails_sent || [],
			backend_timestamp: data.timestamp,
			timestamp: new Date().toISOString(),
			last_run_time: data.last_run_time,
			current_run_time: data.current_run_time,
			time_between_runs: data.time_between_runs
		};
		
	} catch (error) {
		const errorTime = new Date();
		const requestDuration = errorTime - requestStartTime;
		
		console.error(`\n❌ ERROR CALLING BACKEND`);
		console.error(`   Error: ${error.message}`);
		console.error(`   Time: ${errorTime.toISOString()}`);
		console.error(`   Duration before error: ${requestDuration}ms`);
		console.error(`   Stack: ${error.stack}`);
		
		return {
			success: false,
			error: error.message,
			timestamp: new Date().toISOString()
		};
	}
}
