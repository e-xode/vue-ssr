FROM mongo

ADD run.sh /scripts/run.sh
ADD auth.sh /scripts/auth.sh

RUN chmod +x /scripts/*

CMD ["/scripts/run.sh"]
