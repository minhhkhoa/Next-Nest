import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";

const cloundApiRequest = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("fileUpload", file);

    return http.post<ApiResponse<string>>("/cloudinary/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default cloundApiRequest;
