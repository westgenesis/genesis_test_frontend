import { Document, Packer, Paragraph } from "docx";

export const markdownToDoc = async (markdown: string, fileName: string) => {
  const doc = new Document({
    sections: [
      {
        children: [new Paragraph(markdown)],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return new File(
    [blob],

    fileName,

    {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  );
};
