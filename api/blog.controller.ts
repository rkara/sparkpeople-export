import { Router, Request, Response } from 'express';
import { BlogService } from './blog.service';

const router: Router = Router();

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(`Received request to export blog: ${id}`);

  BlogService.GetBlogPdfFile(id)
    .then((pdfBuffer) => {
      res.send(pdfBuffer);
    })
    .catch((e) => {
      if (e === 'Blog not found') {
        res.status(404).send(e);
      } else {
        res.status(500).send('Error occurred');
      }
    });
});

export const BlogController: Router = router;
