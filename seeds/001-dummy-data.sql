INSERT INTO users (id, username, password) VALUES
    (1, 'Eric', 'eric123'),
    (2, 'soldermaster123', 'soldermaster'),
    (3, 'tom_from_work', 'itstom'),
    (4, 'cx', 'cx');

INSERT INTO threads (id, author_id, create_date, title) VALUES
    (1, 1, 1608218220234, 'New Hantek DSO2X1X models?'),
    (2, 4, 1608826559317, 'DS1054z experiences?');

INSERT INTO thread_replies (id, thread_id, author_id, reply_date, content) VALUES
    (1, 1, 2, 1608218220234, 'Hi,

I''ve posted some about this also in the other thread, as it would be nice to know if these models are bandwith hackable, also.

But in this thread my aim is to discuss any available info on these supposed new models, as nothing can be found on Hantek''s site. Could it be that they are fake?? They seem like an upgraded version of DSO5xx2 with much more memory (8M), an in-built function generator, serial decoding, 12bit precision and from 100 to 150 MHz, and cheaper than the DSO5xx2 models. No info on Google or whatsoever, either.'),
    (2, 1, 1, 1608218920234, 'It''s still an 8 bit scope. the AWG is 12 bit.'),
    (3, 1, 3, 1608219920234, 'Hi Eric,

I''m also curious having ordered one from Aliexpress (DSO2C10), do you have actual information on these scopes? could they actually be FAKES? I''m NEW to this...

regards

Tom'),
    (4, 1, 2, 1608220920234, 'Hi! Thanks for the info. I just got to know about that thread some minutes ago. Actually this one is older, so they should be referret to here  ::)

Anyway... I just got mine about two weeks ago but it''s still inside its box for two reasones: first of all, I don''t have the time to play with it due to work & studies constraints, and second, I ordered the 100 Mhz one because it was the only one available at the moment but later I found the 150 one in stock, so I ended ordering it too, hoping I''ll be able to sell the other one. It''s still in transit.

I hope we''ve made a good purchase. Some months ago I was about to buy a DSO5102P but got informed about its short memory length. Then I was in search of a Siglent SDS1202x-e but it''s at about twice is "old" price and I got tired of waiting for months to get a deal, which has not come, even after some failed attempts (fake Amazon ads and so on). Then one day this model appeared suddenly on AliExpress.

What''s not clear to me is what the 12-bit resolution refers to. Some say it''s for the function generator only. Some specs say the oscillo itself has a 12-bit vertical res - others say it''s a 8-bit oscillo. No definite answer.

What I like also is that it comes with serial decoding.

I have very little experience with oscillos. I''ll give more info when I have the chance to play with it.'),
    (5, 2, 4, 1608826559317, replace(replace('Hey all,\r\n\r\nI''m looking to get a beginner level scope and saw EEVBlog''s video on the DS1054z - the video is quite convincing but it''s also a few years old already. Is the DS1054z still the de-facto hobbyist scope or is there a newer scope with better features around the same price point?','\r',char(13)),'\n',char(10)));