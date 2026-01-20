import {
  CategoryNewsApiRequest,
  NewsApiRequest,
} from "@/apiRequest/newsCategory";
import {
  CateNewsCreateType,
  NewsCreateType,
} from "@/schemasvalidation/NewsCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- category News
export const useGetListCategories = () => {
  return useQuery({
    queryKey: ["getListCategories"],
    queryFn: CategoryNewsApiRequest.getListCategories,
  });
};

export const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["getCategoryById", id],
    queryFn: () => CategoryNewsApiRequest.getCategoryById(id),
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

export const useGetNewsById = (id: string) => {
  return useQuery({
    queryKey: ["getNewsById", id],
    queryFn: () => NewsApiRequest.getNewsById(id),
  });
};

export const useGetListNewsDashboard = () => {
  return useQuery({
    queryKey: ["getListNewsDashboard"],
    queryFn: NewsApiRequest.getListNewsDashboard,
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

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: NewsApiRequest.createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getListNewsFilter"] });
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NewsCreateType }) =>
      NewsApiRequest.updateNews(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getListNewsFilter"] });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: NewsApiRequest.deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getListNewsFilter"] });
    },
  });
};
