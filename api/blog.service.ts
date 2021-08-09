const fs = require('fs');
const http = require('https');
const HTMLParser = require('node-html-parser');
const html_to_pdf = require('html-pdf-node');

const SPARK_ROOT = 'https://www.sparkpeople.com';

export class BlogService {
  static GetBlogPdfFile(userId: string) {
    const uri = `${SPARK_ROOT}/mypage_public_journal_summary.asp?id=${userId}`;
    return this.GetSparkPeopleBlogIds(uri).then((blogIds) => {

      if(blogIds.length === 0) {
        return Promise.reject('Blog not found');
      }

      const promises = [];

      for (const blogId of blogIds) {
        const promise = this.GetSparkPeoplePostContent(blogId);
        promises.push(promise);
      }

      return Promise.all(promises)
        .then((contentArr) => {
          let pageContent = '';
          contentArr.forEach((c) => (pageContent += c));
          let options = {
            format: 'A4',
            margin: {
              top: '10px',
              bottom: '10px',
              left: '10px',
              right: '10px',
            },
          };
          const file = { content: pageContent };
          console.log('Generating PDF Document');

          return html_to_pdf
            .generatePdf(file, options)
            .then((pdfBuffer: any) => {
              return pdfBuffer;
            })
            .catch((e: any) => {
              console.error('Error creating PDF', e);
            });
        })
        .catch(() => {
          return Promise.reject('Blog not found');
        });
    });
  }

  private static GetSparkPeoplePostContent(postId: number) {
    const uri = `${SPARK_ROOT}/mypage_public_journal_individual.asp?blog_id=${postId}`;
    return this.GetHtmlFromUri(uri)
      .then((root: any) => {
        const entryBody = root.querySelector('#entry_body');
        const popularButton = entryBody.querySelector('#popular_btn');
        if (popularButton) {
          popularButton.parentNode.removeChild(popularButton);
        }
        const entryButtons = entryBody.querySelector('#entry_btns');
        if (entryButtons) {
          entryButtons.parentNode.removeChild(entryButtons);
        }
        const categoryButtons = entryBody.querySelector('#blog_cat');
        if (categoryButtons) {
          categoryButtons.parentNode.removeChild(categoryButtons);
        }

        const style = ` <style>
            body { font-family: Arial, Helvetica, sans-serif !important; }
        </style>`;
        return ` <html>
            ${style}
            <body>
                ${entryBody.outerHTML.replace('Report Inappropriate Blog', '')}
            </body>
        </html>`;
      })
      .catch((e) => {
        console.error(`Error reading blog ${postId}`, e);
        return undefined;
      });
  }

  private static GetSparkPeopleBlogIds(uri: string) {
    return this.GetSparkPeoplePageCount(uri)
      .then((pageCount) => {
        if(pageCount === 0) {
          return Promise.reject('Unable to find blog');
        }
        const promiseArr = [];
        for (let i = 0; i < pageCount; i++) {
          const promise = this.GetSparkPeopleBlogIdsFromPage(uri, i + 1);
          promiseArr.push(promise);
        }
        return Promise.all(promiseArr);
      })
      .then((blogIdSets) => {
        let blogIds: number[] = [];
        for (const blogIdSet of blogIdSets) {
          blogIds = blogIds.concat(blogIdSet);
        }
        return blogIds.sort().filter((v, i) => blogIds.indexOf(v) === i);
      });
  }

  private static GetSparkPeoplePageCount(uri: string) {
    return this.GetHtmlFromUri(uri).then((root: any) => {
      const pageLinks = root.querySelectorAll('.paging_btn2');
      return pageLinks.length - 1;
    });
  }

  private static GetSparkPeopleBlogIdsFromPage(uri: string, pageIndex: number) {
    return this.GetHtmlFromUri(`${uri}&page=${pageIndex}`)
      .then((data) => {
        const root = HTMLParser.parse(data);
        const blogPostLinks = root
          .querySelectorAll('.member_journal_title_link')
          .map((l: any) => {
            const href = l.getAttribute('href');
            const blogIdStr = href.replace(
              'mypage_public_journal_individual.asp?blog_id=',
              ''
            );
            return parseInt(blogIdStr, 10);
          });
        return blogPostLinks;
      })
      .catch((_) => {
        return { error: 'Unable to find blog'};
      });
  }

  private static GetHtmlFromUri(uri: string) {
    return new Promise((resolve, reject) => {
      const request = http.request(uri, function (res: any) {
        var data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(HTMLParser.parse(data));
        });
      });
      request.on('error', (e: any) => {
        reject(e.message);
      });
      request.end();
    });
  }
}
