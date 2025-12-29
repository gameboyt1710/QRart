# QRart Hosting Options - Free & Cheap

## 🏠 Option 1: Host From Your Machine (FREE)

**Pros:**
- ✅ Completely free
- ✅ Full control
- ✅ No vendor lock-in
- ✅ Test locally, then expose to internet

**Cons:**
- ❌ Your machine must stay on 24/7
- ❌ Requires static IP or dynamic DNS
- ❌ Slower uploads/downloads (residential internet)
- ❌ ISP may block incoming ports

**How to do it:**

1. **Run locally:**
```bash
docker-compose up
```

2. **Expose to internet (choose one):**

   **A) Use ngrok (easiest):**
   ```bash
   # Install: brew install ngrok
   ngrok http 4000
   # Gives you: https://xxxx-xxxx.ngrok.io
   ```
   - Free tier: 2 hours per session
   - Paid: $12/month for persistent URL

   **B) Use Cloudflare Tunnel (better):**
   ```bash
   # Install cloudflared
   cloudflared tunnel --url http://localhost:4000
   # Gives you: https://xxx.trycloudflare.com (random each time)
   ```
   - Completely FREE
   - No account needed
   - Good for testing

   **C) Port forward (risky):**
   - Port forward port 4000 in your router
   - Get your public IP: `curl ifconfig.me`
   - Share: `http://YOUR_IP:4000`
   - Problem: ISP may block, not secure, can change

---

## 💰 Option 2: Cheap VPS ($6-10/month)

**Providers:**
- **DigitalOcean**: $6/month (512MB RAM is tight, go for $12)
- **Hetzner**: €4/month (~$4 USD) - best value
- **Linode**: $6/month
- **Vultr**: $6/month

**Pros:**
- ✅ Runs 24/7
- ✅ Static IP
- ✅ Reliable
- ✅ No bandwidth limits
- ✅ Easy to scale

**Cons:**
- ❌ Costs money (but cheap)

**How:**
1. Rent droplet ($6/month)
2. SSH into it
3. Install Docker
4. Push your code
5. Run: `docker-compose up -d`
6. Get a domain (~$10/year on Namecheap)
7. Point domain to VPS IP
8. Done!

---

## 🆓 Option 3: Free Tier Services (Limited)

**Heroku** (now paid, skip)
**Railway** (requires card, $5/month minimum)
**Render** (free tier available):
- 512MB RAM
- Spins down after 15 mins of inactivity
- Not good for production
- Good for testing only

**Replit** (free tier):
- Run Node servers
- Free tier is slow/limited
- OK for testing

---

## 🎯 My Recommendation

**For NOW (testing phase):**
Use **Cloudflare Tunnel** (free) from your machine
```bash
# Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:4000
```
- Run on your Mac while testing
- Share the temporary URL with users
- No cost, no setup

**When ready for production:**
Get a **Hetzner VPS** (€4/month = $4 USD)
- Cheapest reliable option
- Full control
- Stays online 24/7

---

## 📊 Cost Breakdown (Yearly)

| Option | Cost/Month | Total/Year |
|--------|-----------|-----------|
| Your machine + ngrok free | $0 | $0 |
| Your machine + Cloudflare Tunnel | $0 | $0 |
| Your machine + ngrok pro | $12 | $144 |
| Hetzner VPS | €4 ($4) | €48 ($48) |
| DigitalOcean | $6-12 | $72-144 |
| Domain (.com on Namecheap) | - | ~$9/year |

---

## 🚀 Quick Start - Cloudflare Tunnel (FREE)

1. Download cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

2. Run your app:
```bash
docker-compose up
```

3. In another terminal:
```bash
cloudflared tunnel --url http://localhost:4000
```

4. You get: `https://xxx.trycloudflare.com`

5. Share that URL with testers!

**That's it. Free testing, right now.**

---

## 💡 When You Need Production

Once you're ready for real deployment:

```bash
# 1. Rent Hetzner VPS (€4/month)
# 2. SSH in, install Docker
# 3. Clone your repo
# 4. Run:
docker-compose up -d

# 5. Set up HTTPS with Let's Encrypt
# (docker-compose can auto-handle this)

# 6. Add your domain
# Done!
```

---

## Questions?

- **Can I use this with the extension?** Yes! Extension works with any URL
- **Can others access it?** Yes, share the Cloudflare URL
- **Will it be slow?** Cloudflare Tunnel is actually fast - uses Cloudflare's network
- **Can I make it permanent?** Use ngrok pro ($12/month) for persistent URLs
