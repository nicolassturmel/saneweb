## Prerequisite

scanimage: apt install scanimage
imagemagick: apt install imagemagick

check imagemagick pdf policy in /etc/ImageMagick-7/policy.xml
<policy domain="coder" rights="read | write" pattern="PDF" />
