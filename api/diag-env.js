module.exports = (req,res) => { const key = process.env.ANTHROPIC_API_KEY; res.status(200).json({ anthropic_api_key_present: Boolean(key) }); };


