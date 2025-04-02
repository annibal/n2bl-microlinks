import { baseUrl, pool } from '../server-helpers/db-pool.js';
import { generateMicro, isValidUrl } from '../server-helpers/utils.js';

export async function findMicroRegistry(params) {
  const { micro, link, id } = params;

  let paramCount = 0;
  let glue = ['WHERE', 'AND'];
  let query = [
    'SELECT * FROM micro_link_registry',
    Boolean(micro) && `${glue[+!!paramCount]} micro = $${++paramCount}`,
    Boolean(link) && `${glue[+!!paramCount]} link = $${++paramCount}`,
    Boolean(id) && `${glue[+!!paramCount]} id = $${++paramCount}`,
  ]
    .filter(Boolean)
    .join(' ');

  let paramsValues = [];
  if (micro) paramsValues.push(micro);
  if (link) paramsValues.push(link);
  if (id) paramsValues.push(id);

  // console.log('findMicroRegistry()');
  // console.log(`>>: micro: "${micro}", link: "${link}", id: "${id}"`);
  // console.log('>>: query: ', query);
  // console.log('>>: pvalues: ', paramsValues);

  const result = await pool.query(query, paramsValues);
  // console.log('>>: result:', result);
  return result.rows[0];
}

export async function handleCreateMicro(params = {}) {
  const { link, label, passcode, clientInfo } = params || {};

  if (!link || !isValidUrl(link)) {
    return { status: 401, payload: { success: false, error: 'Invalid URL' } };
  }

  try {
    const microlinkResult = await findMicroRegistry({ link });
    if (microlinkResult?.micro) {
      const micro = microlinkResult.micro;
      return { status: 200, payload: { success: true, data: { micro, microUrl: `${baseUrl}/${micro}` } } };
    }
  } catch (error) {
    console.error('Error checking if micro link exists:', error);
  }

  try {
    let micro;
    let retries = 0;
    let inserted = false;

    while (!inserted && retries < 3) {
      micro = generateMicro();

      try {
        const query = `
          INSERT INTO micro_link_registry (link, micro, label, passcode, info) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING micro
        `;

        await pool.query(query, [link, micro, label || null, passcode || null, clientInfo || null]);
        inserted = true;
      } catch (err) {
        if (err.code === '23505') {
          // the magical number 23505 means 'unique violation'
          retries++;
        } else {
          throw err;
        }
      }
    }

    if (!inserted) {
      throw new Error('Failed to generate unique micro code');
    }

    console.info('Created micro link:', micro);
    return { status: 201, payload: { success: true, data: { micro, microUrl: `${baseUrl}/${micro}` } } };
  } catch (error) {
    console.error('Error creating micro link:', error);
    return { status: 500, payload: { success: false, error: 'Failed to create micro link' } };
  }
}
