import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentFolders } from "@admin/store/slices/documentsSlice";

export default function useFolderTree() {
  const dispatch = useDispatch();
  const foldersByParent = useSelector(
    (s) => s.documents?.foldersByParent || {},
  );

  // Ensure root loaded on mount
  useEffect(() => {
    if (!foldersByParent.root) {
      dispatch(fetchDocumentFolders(null));
    }
  }, [dispatch, foldersByParent.root]);

 const ensureLoaded = useCallback(
  (parentId, force = false) => {
    const key = parentId == null ? "root" : String(parentId);
    if (force || !foldersByParent[key]) {
      dispatch(fetchDocumentFolders(parentId));
    }
  },
  [dispatch, foldersByParent],
);

  const childrenOf = useCallback(
    (parentId) => {
      const key = parentId == null ? "root" : String(parentId);
      return foldersByParent[key] || [];
    },
    [foldersByParent],
  );

  const isLoading = useCallback(
    (parentId) => {
      const key = parentId == null ? "root" : String(parentId);
      return foldersByParent[key] === undefined;
    },
    [foldersByParent],
  );

  return useMemo(
    () => ({ childrenOf, ensureLoaded, isLoading }),
    [childrenOf, ensureLoaded, isLoading],
  );
}