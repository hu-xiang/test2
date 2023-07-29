export type BasicListItemDataType = {
  id: string;
};

export type TableListParams = {
  id: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  current?: number;
  filter?: Record<string, ReactText[] | null>;
  sorter?: Record<string, SortOrder>;
};
