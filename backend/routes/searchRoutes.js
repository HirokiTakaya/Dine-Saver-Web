app.get('/search', async (req, res) => {
    const { location, term } = req.query;
    try {
      const data = await getYelpData(location, term);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });