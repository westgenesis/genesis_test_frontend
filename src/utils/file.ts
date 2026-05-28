import type { AxiosResponse } from "axios";

/**
 * 从axios的response中下载文件
 * @param {AxiosResponse<Blob>} response
 * @param {string} [defaultFileName="download"]
 */
export const downloadByResponse = (
  response: AxiosResponse<Blob>,
  defaultFileName = "download",
) => {
  const blob = response.data;

  if (!(blob instanceof Blob)) {
    throw new Error("response.data is not Blob");
  }

  // 获取文件名

  const disposition = response.headers["content-disposition"];

  let filename = defaultFileName;

  if (disposition) {
    // RFC5987

    const utf8FilenameMatch = disposition.match(/filename\*=UTF-8''(.+)/i);

    // 普通 filename=

    const filenameMatch = disposition.match(/filename="?(.+?)"?$/i);

    if (utf8FilenameMatch?.[1]) {
      filename = decodeURIComponent(utf8FilenameMatch[1]);
    } else if (filenameMatch?.[1]) {
      filename = decodeURIComponent(filenameMatch[1]);
    }
  }

  // 创建下载链接

  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = blobUrl;

  a.download = filename;

  document.body.appendChild(a);

  a.click();

  a.remove();

  window.URL.revokeObjectURL(blobUrl);
};
