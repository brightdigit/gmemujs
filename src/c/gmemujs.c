
#include <stdlib.h>
#include <stdio.h>
#include "gme.h"

typedef struct AlbumBuilder
{
    int sample_rate;
} AlbumBuilder;

typedef struct Album {
    Music_Emu* emu;
    int track_count;
} Album;

char* gmemujs_test () {
  return "hello world!";
}

AlbumBuilder * initialize (int sample_rate) {
  AlbumBuilder * builder;
  builder = malloc(sizeof(AlbumBuilder));
  builder->sample_rate = sample_rate;
  return builder;
}

Album * open_data (AlbumBuilder * builder, void const * data, long size) {
  Album * album;
  Music_Emu* emu;
  gme_open_data(data, size, &emu, builder->sample_rate);
  album = malloc(sizeof(Album));
  album->emu = emu;
  album->track_count = gme_track_count(emu);
  return album;
}

int track_count (Album * album) {
  return album->track_count;
}


/*
#include <stdlib.h>
#include <stdio.h>
#include "gme.h"

const char* info_fmt = "{\"trackCount\": %d, \"length\": %d, \"system\": \"%s\", \"game\": \"%s\", \"song\": \"%s\", \"author\": \"%s\", \"copyright\": \"%s\", \"comment\": \"%s\", \"dumper\": \"%s\"}";

static Music_Emu* emu;
static gme_info_t * track_info;
static char json_str[2048];
static short audio_buffer[8192 * 2];

void handle_error(const char* str) {
    if (str) {
        printf("Error: %s\n", str); getchar();
        exit(EXIT_FAILURE);
    }
}

void meat_open_data(void const* data, long size, int track) {
    handle_error(gme_open_data(data, size, &emu, 44100));
    handle_error(gme_start_track(emu, track));
}

void meat_open_file(char* filename, int track) {
    handle_error(gme_open_file(filename, &emu, 44100));
    handle_error(gme_start_track(emu, track));
}

void meat_start_track(int track) {
    handle_error(gme_start_track(emu, track));
}

short* meat_generate_sound_data() {
    handle_error(gme_play(emu, 8192 * 2, audio_buffer));
    return audio_buffer;
}

char* meat_song_info(int track) {
    handle_error(gme_track_info(emu, &track_info, track));
    int track_count = gme_track_count(emu);
    sprintf(json_str, info_fmt, track_count, track_info->length,
            track_info->system, track_info->game, track_info->song, track_info->author,
            track_info->copyright, track_info->comment, track_info->dumper);
    return json_str;
}
*/