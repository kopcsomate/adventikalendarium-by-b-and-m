export default function handler(req, res) {
  const now = new Date();

  const day = now.getUTCDate();
  const month = now.getUTCMonth() + 1;

  res.status(200).json({
    day,
    month,
    iso: now.toISOString()
  });
}
