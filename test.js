const fauna = require('./index')
const { query: q } = fauna
const db = new fauna.Client({
  secret: 'fnADrL7VfSACAhtIplPXl_C-iX20yk6hQbReCxAI',
})

;(async () => {
  // let res = await db.query(q.Let({ super: true }, q.Var('super')))
  // console.log(res);
  // console.log(Boolean(""._isFaunaRef));
  console.log(typeof new fauna.Expr('ok'))
})()
