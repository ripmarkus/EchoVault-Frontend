FROM nginx:alpine

# Ryd default content
RUN rm -rf /usr/share/nginx/html/*

COPY HTML/ /usr/share/nginx/html/
COPY CSS/ /usr/share/nginx/html/CSS/
COPY JS/ /usr/share/nginx/html/JS/

EXPOSE 80 443
