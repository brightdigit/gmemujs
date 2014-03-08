
#include <stdlib.h>
#include <stdio.h>
#include "gme.h"

/*
int length;     /* total length, if file specifies it */
//  int intro_length; /* length of song up to looping section */
//  int loop_length;  /* length of looping section */
  
  /* Length if available, otherwise intro_length+loop_length*2 if available,
  otherwise a default of 150000 (2.5 minutes). */
//  int play_length;

const char* info_fmt = "{\"length\": %d, \"system\": \"%s\", \"game\": \"%s\", \"song\": \"%s\", \"author\": \"%s\", \"copyright\": \"%s\", \"comment\": \"%s\", \"dumper\": \"%s\"}";

static char json_str[2048];
static short audio_buffer[8192 * 2];
static Music_Emu* emu;
typedef struct AlbumBuilder
{
    int sample_rate;
    int buffer_size;
} AlbumBuilder;

typedef struct Album {
  AlbumBuilder* album_builder;
    int track_count;
} Album;

typedef struct Track {
    Album* album;
    int number;
} Track;

typedef struct PlayInfo
{
    AlbumBuilder * album_builder;
    Track * track;
} PlayInfo;
char* gmemujs_test () {
  return "hello world!";
}

AlbumBuilder * initialize (int sample_rate, int buffer_size) {
  AlbumBuilder * builder;
  builder = malloc(sizeof(AlbumBuilder));
  builder->sample_rate = sample_rate;
  builder->buffer_size = buffer_size;
  return builder;
}

Album * open_data (AlbumBuilder * builder, void const * data, long size) {
  Album * album;
  gme_open_data(data, size, &emu, builder->sample_rate);
  album = malloc(sizeof(Album));
  album->album_builder = builder;
  album->track_count = gme_track_count(emu);
  return album;
}

Track * open_track (Album * album, int track_number) {
  Track * track;
  track = malloc(sizeof(Track));
  track->album = album;
  track->number = track_number;
  return track;
}

char* track_info (Track * track) {
  //char json_str[2048];
  gme_info_t * track_info;
  gme_track_info(emu, &track_info, track->number);
  sprintf(json_str, info_fmt, track_info->play_length,
    track_info->system, track_info->game, track_info->song, track_info->author,
    track_info->copyright, track_info->comment, track_info->dumper);
  return json_str;
}

int track_count (Album * album) {
  return album->track_count;
}


PlayInfo * play_info (Track * track) {
  PlayInfo * playinfo = malloc(sizeof(PlayInfo));
  playinfo->album_builder = track->album->album_builder;
  playinfo->track = track;
  return playinfo;
}

PlayInfo * track_start (Track * track) {
  PlayInfo * playinfo = play_info(track);
  gme_start_track(emu, track->number);
  return playinfo;
}

short * generate_sound_data (int buffer_size) {
  gme_play(emu, 8192 * 2, audio_buffer);
  //printf("%d", buffer_size);
  //printf("%d", buffer_size);
  return audio_buffer;
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