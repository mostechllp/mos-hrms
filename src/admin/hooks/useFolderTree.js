import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentFolders } from "@admin/store/slices/documentsSlice";

export default function useFolderTree() {
  const dispatch = useDispatch();
  const foldersByParent = useSelector(
    (s) => s.documents?.foldersByParent || {},
  );
  // Flat, deduped list of every folder we've ever loaded
  const folders = useSelector((s) => s.documents?.folders || []);

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

  // Flat id → folder lookup (used to rebuild breadcrumb from a URL folder id)
  const foldersById = useMemo(() => {
    const map = {};
    folders.forEach((f) => {
      map[f.id] = f;
      // Also index by string key so `foldersById["42"]` works too
      map[String(f.id)] = f;
    });
    return map;
  }, [folders]);

  return useMemo(
    () => ({ childrenOf, ensureLoaded, isLoading, foldersById }),
    [childrenOf, ensureLoaded, isLoading, foldersById],
  );
}