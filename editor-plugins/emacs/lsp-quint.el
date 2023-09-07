;;; lsp-quint.el --- Quint LSP Client settings
;;;
;; Copyright (C) 2023 Gabriela Moreira

;; Author: Gabriela Moreira (gabriela@informal.systems)
;; URL: https://github.com/informalsystems/quint
;; Version: 1.0.0
;; Created: 28 Aug 2023
;; Updated 21 Aug 2023
;; Keywords: languages

;; This file is not part of GNU Emacs.

;;; Commentary:

;; A client for lsp-mode for the Quint Specification Language, using the quint language server.

;;; Code:

(require 'lsp-mode)
(require 'lsp-completion)

(defgroup lsp-quint nil
  "LSP support for the Quint Specification Language, using the quint language server."
  :link '(url-link "https://github.com/informalsystems/quint")
  :group 'lsp-mode
  :package-version '(lsp-mode . "6.3.2"))

(lsp-dependency 'quint-language-server
                '(:system "quint-language-server")
                '(:npm :package "@informalsystems/quint-language-server"
                       :path "quint-language-server"))

(add-to-list 'lsp-language-id-configuration '(quint-mode . "quint"))
(lsp-register-client
 (make-lsp-client :new-connection (lsp-stdio-connection
                                   (lambda () (list (lsp-package-path 'quint-language-server) "--stdio")))
                  :major-modes '(quint-mode)
                  :activation-fn (lsp-activate-on "quint")
                  :language-id "quint"
                  :priority 0
                  :server-id 'quint-language-server
                  :completion-in-comments? t
                  :download-server-fn (lambda (_client callback error-callback _update?)
                                        (lsp-package-ensure
                                         'quint-language-server
                                         (-partial #'lsp-package-ensure
                                                   'quint-language-server
                                                   callback
                                                   error-callback)
                                         error-callback))))

(lsp-consistency-check lsp-quint)

(provide 'lsp-quint)
;;; lsp-quint.el ends here
