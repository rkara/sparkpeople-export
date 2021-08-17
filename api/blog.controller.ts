import { Router, Request, Response } from 'express';
import { BlogService } from './blog.service';

const router: Router = Router();

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(`[${new Date().toTimeString()}] - Received request to export blog: ${id}`);

  BlogService.GetBlogPdfFile(id)
    .then((pdfBuffer) => {
      console.log(`[${new Date().toTimeString()}] - Sending response of blog: ${id}`);
      res.send(pdfBuffer);
    })
    .catch((e) => {
      if (e === 'Blog not found') {
        console.log(`[${new Date().toTimeString()}] - Blog not found: ${id}`);
        res.status(404).send(e);
      } else {
        console.log(`[${new Date().toTimeString()}] - Blog error occurred: ${id}`);
        res.status(500).send('Error occurred');
      }
    });
});

export const BlogController: Router = router;
