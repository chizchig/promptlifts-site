// Cloudflare Function – POST /submit
export async function onRequestPost(context) {
  const { request, env } = context;
  const data = await request.formData();

  const body = {
    name:  data.get('name').trim(),
    email: data.get('email').trim(),
    brief: data.get('brief').trim(),
    ts:    new Date().toISOString()
  };

  // 1. Send yourself an email (via Cloudflare Email Routing)
  await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.ACCOUNT_ID+'/email/routing/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': env.CF_EMAIL,
      'X-Auth-Key':   env.CF_KEY
    },
    body: JSON.stringify({
      from: { email: 'orders@promptlifts.com', name: 'PromptLifts Bot' },
      to:   [{ email: 'your-email@gmail.com', name: 'You' }],
      subject: `New custom-prompt quote – ${body.name}`,
      text: `Name: ${body.name}\nEmail: ${body.email}\nBrief: ${body.brief}\n\nTime: ${body.ts}`
    })
  });

  // 2. Add them to your mailing list (MailerLite free group)
  await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MailerLite-ApiKey': env.ML_APIKEY
    },
    body: JSON.stringify({
      email: body.email,
      name:  body.name,
      groups: ['promptlifts-leads']
    })
  });

  return new Response('ok', { status: 200 });
}