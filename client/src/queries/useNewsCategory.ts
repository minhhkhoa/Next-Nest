import {
  CategoryNewsApiRequest,
  NewsApiRequest,
} from "@/apiRequest/newsCategory";
import { CateNewsCreateType } from "@/schemasvalidation/NewsCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- category News
export const useGetListCategories = () => {
  return useQuery({
    queryKey: ["getListCategories"],
    queryFn: CategoryNewsApiRequest.getListCategories,
  });
};

//- create category news
export const useCreateCategoryNewsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CategoryNewsApiRequest.createCategory,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey: ["getListCategories"] });
    },
  });
};

//- update category news
export const useUpdateCategoryNewsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CateNewsCreateType;
    }) => CategoryNewsApiRequest.updateCategory(id, payload),
    onSuccess: () => {
      //- gọi lại api khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey: ["getListCategories"] });
    },
  });
};

//- delete category news
export const useDeleteCategoryNewsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CategoryNewsApiRequest.deleteCategory,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getListCategories"] });
    },
  });
};

//- end category news

//- News
export const useGetListNews = () => {
  return useQuery({
    queryKey: ["getListNews"],
    queryFn: NewsApiRequest.getListNews,
  });
};

export const useGetListNewsFilter = ({
  currentPage,
  pageSize,
  title,
  cateNewsID,
  status,
}: {
  currentPage: number;
  pageSize: number;
  title?: string;
  cateNewsID?: string | null;
  status?: string;
}) => {
  return useQuery({
    queryKey: [
      "getListNewsFilter",
      currentPage,
      pageSize,
      title,
      cateNewsID,
      status,
    ],
    queryFn: () =>
      NewsApiRequest.getListNewsFilter({
        currentPage,
        pageSize,
        title: title ?? "",
        cateNewsID: cateNewsID ?? "",
        status: status ?? "",
      }),
  });
};
