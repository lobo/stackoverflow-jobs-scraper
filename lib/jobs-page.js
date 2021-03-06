const debug = require('debug')('so-page');

debug.enabled = true;

function parseJob(job) {
  const equity = job.salary.indexOf(' | Equity') >= 0;
  const salary = job.salary
    .replace(' | Equity', '')
    .split(' ');

  const currency = job.salary[0];
  const min = salary[0].substr(1);
  const max = salary.slice(-1)[0];

  return {
    title: job.title,
    href: job.href,
    currency,
    'minimum-salary': Number(min.replace('k', '000')),
    'maximum-salary': Number(max.replace('k', '000')),
    equity,
  };
}

function parseRows(rows) {
  return rows.map(row => ({
    title: row.querySelector('.job-link').innerText,
    href: row.querySelector('.job-link').href,
    salary: row.querySelector('span.-salary') && row.querySelector('span.-salary').innerText,
  }));
}

module.exports = class StackOverflowJobsPage {
  constructor(page) {
    this.page = page;
  }

  async getPage(link) {
    debug('Loading page %s', link);

    await this.page.goto(link);

    const jobs = [];

    const rows = await this.page.$$eval('div.-job-summary', parseRows);
    rows.forEach((job) => {
      if (job.salary && job.salary.indexOf(' ') > 0) {
        jobs.push(parseJob(job));
      }
    });

    return jobs;
  }
};
