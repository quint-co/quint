# Emacs support

We have 2 packages for enabling support for Quint in Emacs.

1. `quint-mode` is a major mode that enables simple syntax highlighting
2. `lsp-quint` is a client for `lsp-mode`, enabling IDE features provided by `quint-language-server`

These packages are not published anywhere for the moment. You can clone this git repo and add a configuration like the following (which uses `use-package`):

```elisp
(load-file "<path-to-quint-repo>/editor-plugins/emacs/quint-mode.el")
(load-file "<path-to-quint-repo>/editor-plugins/emacs/lsp-quint.el")
(require 'quint-mode)
(add-to-list 'auto-mode-alist '("\\.qnt" . quint-mode))
(use-package lsp-quint
  :ensure t
  :hook (quint-mode . lsp))
```
