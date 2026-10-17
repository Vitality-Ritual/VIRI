#!/bin/bash
# Save the Resend API key (from the margaret@vitalityritual.org Resend account)
# where newsletter/make-resend-draft.rb reads it. The key is not shown as you paste.
mkdir -p ~/.config/viri
read -r -s -p "Paste your Resend key, then press Return: " key
echo
key="$(printf %s "$key" | tr -d '[:space:]')"
case "$key" in
  re_*) printf %s "$key" > ~/.config/viri/resend_key.txt
        chmod 600 ~/.config/viri/resend_key.txt
        echo "Saved. You can close this tab." ;;
  *)    echo "That doesn't look like a Resend key (they start with re_). Nothing was saved." ;;
esac
