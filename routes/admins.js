router.post("/login", async (req, res) => {
  console.log("BODY:", req.body); // 👈 مهم
  console.log("HEADERS:", req.headers["content-type"]);

  const password = req.body?.password?.trim();

  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  res.json({ ok: true });
});


export default router;
