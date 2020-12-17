INSERT INTO users (id, username, password) VALUES
    (1, 'Eric', '202cb962ac59075b964b07152d234b70'),
    (2, 'soldermaster123', 'bb6a706592737be29c35f35560318eda'),
    (3, 'tom_from_work', 'd077f244def8a70e5ea758bd8352fcd8');

INSERT INTO threads (id, author_id, create_date, title) VALUES
    (1, 1, 1608218220234, 'New Hantek DSO2X1X models?');

INSERT INTO thread_replies (id, thread_id, author_id, reply_date, content) VALUES
    (1, 1, 2, 1608218220234, 'Hi,

I've posted some about this also in the other thread, as it would be nice to know if these models are bandwith hackable, also.

But in this thread my aim is to discuss any available info on these supposed new models, as nothing can be found on Hantek's site. Could it be that they are fake?? They seem like an upgraded version of DSO5xx2 with much more memory (8M), an in-built function generator, serial decoding, 12bit precision and from 100 to 150 MHz, and cheaper than the DSO5xx2 models. No info on Google or whatsoever, either.');